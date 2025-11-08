/**
 * Anchor IDL Fixer for Version 0.32.1
 * 
 * This script converts IDL files to the format expected by Anchor 0.32.1.
 * 
 * Key transformations:
 * 1. Moves address from metadata.address to top-level address field
 * 2. Generates discriminators for account definitions
 * 3. Moves account struct definitions from inline to types section
 * 4. Converts "publicKey" (camelCase) to "pubkey" (lowercase)
 * 
 * Usage:
 *   node scripts/fix-idl-v0.32.mjs
 *   cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json
 * 
 * @see docs/IDL_TROUBLESHOOTING_GUIDE.md for detailed explanation
 * @see docs/DEBUGGING_PROCESS.md for the debugging journey
 */

import fs from 'node:fs';
import crypto from 'node:crypto';

// Configuration
const IN = 'target/idl/pangi_token.json';
const OUT = 'target/idl/pangi_token.fixed.json';

// Load the IDL file
const idl = JSON.parse(fs.readFileSync(IN, 'utf8'));

// ============================================================================
// TRANSFORMATION 1: Move address to top level
// ============================================================================
// Anchor 0.32.1 expects the program address at the top level of the IDL,
// not nested inside the metadata object.
//
// Before: { "metadata": { "address": "..." } }
// After:  { "address": "...", "metadata": {} }
//
// This fixes the error:
// "Cannot read properties of undefined (reading '_bn')"
// ============================================================================

if (!idl.address && idl.metadata?.address) {
  idl.address = idl.metadata.address;
  delete idl.metadata.address;
}

// ============================================================================
// TRANSFORMATION 2: Restructure accounts and types
// ============================================================================
// Anchor 0.32.1 requires:
// 1. Account definitions in `accounts` section with name + discriminator only
// 2. Full struct definitions in `types` section
// 3. Each account must have a discriminator (8-byte identifier)
//
// The discriminator is generated from SHA256("account:<AccountName>")
// and serves as a unique identifier for the account type in the program.
//
// Before:
// {
//   "accounts": [
//     { "name": "Config", "type": { "kind": "struct", "fields": [...] } }
//   ],
//   "types": []
// }
//
// After:
// {
//   "accounts": [
//     { "name": "Config", "discriminator": [38, 187, ...] }
//   ],
//   "types": [
//     { "name": "Config", "type": { "kind": "struct", "fields": [...] } }
//   ]
// }
//
// This fixes the errors:
// - "Account not found: <name>"
// - "The first argument must be of type string or an instance of Buffer"
// ============================================================================

idl.accounts ||= [];
idl.types ||= [];

/**
 * Generate an 8-byte discriminator for an account type.
 * 
 * The discriminator is the first 8 bytes of SHA256("account:<AccountName>").
 * This serves as a unique identifier for the account type in the program.
 * 
 * @param {string} accountName - The name of the account (e.g., "TaxConfig")
 * @returns {number[]} Array of 8 bytes
 * 
 * @example
 * generateDiscriminator("TaxConfig")
 * // Returns: [38, 187, 35, 231, 115, 102, 30, 82]
 */
function generateDiscriminator(accountName) {
  const hash = crypto.createHash('sha256');
  hash.update(`account:${accountName}`);
  const digest = hash.digest();
  return Array.from(digest.slice(0, 8));
}

// Map existing types by name for easy lookup
const typeByName = new Map(idl.types.map(t => [t.name, t]));

// Process each account definition
idl.accounts = idl.accounts.map(acc => {
  // Generate discriminator if missing
  if (!acc.discriminator) {
    acc.discriminator = generateDiscriminator(acc.name);
  }
  
  // If account has inline type definition, move it to types section
  if (acc.type && acc.type.kind === 'struct') {
    // Add to types map
    typeByName.set(acc.name, { name: acc.name, type: acc.type });
    
    // Return simplified account definition (name + discriminator only)
    return { name: acc.name, discriminator: acc.discriminator };
  }
  
  return acc;
});

// Rebuild types array from the map
idl.types = [...typeByName.values()];

// ============================================================================
// TRANSFORMATION 3: Convert PublicKey type format
// ============================================================================
// Anchor 0.32.1 uses "pubkey" (lowercase) for PublicKey fields.
// Newer versions use "publicKey" (camelCase).
//
// This transformation recursively walks the IDL and converts:
// - "publicKey" → "pubkey"
// - {"defined": "Pubkey"} → "pubkey"
//
// Before: {"name": "authority", "type": "publicKey"}
// After:  {"name": "authority", "type": "pubkey"}
//
// This fixes the error:
// "Cannot use 'in' operator to search for 'option' in publicKey"
//
// The error occurs because Anchor's IdlCoder has a switch statement with
// case "pubkey" (lowercase). When it receives "publicKey", it falls through
// to the default case which tries to check if the type is an object with
// an "option" property, causing the error.
// ============================================================================

/**
 * Recursively walk the IDL structure and convert type formats.
 * 
 * This function handles:
 * 1. Converting "publicKey" strings to "pubkey"
 * 2. Converting {"defined": "Pubkey"} objects to "pubkey"
 * 3. Recursively processing nested objects and arrays
 * 
 * @param {*} v - The value to process (can be any type)
 * @returns {*} The processed value with converted types
 */
function walk(v) {
  // Handle arrays: recursively process each element
  if (Array.isArray(v)) {
    return v.map(walk);
  }
  
  // Handle objects
  if (v && typeof v === 'object') {
    // Convert {"defined": "Pubkey"} to "pubkey"
    if (v.defined && typeof v.defined === 'string' && v.defined.toLowerCase() === 'pubkey') {
      return 'pubkey';
    }
    
    // Recursively process object properties
    const o = {};
    for (const [k, val] of Object.entries(v)) {
      // Convert "publicKey" string to "pubkey"
      if (k === 'type' && val === 'publicKey') {
        o[k] = 'pubkey';
      } else {
        o[k] = walk(val);
      }
    }
    return o;
  }
  
  // Return primitives unchanged
  return v;
}

// Apply transformations to the entire IDL
const fixed = walk(idl);

// ============================================================================
// Write the fixed IDL to output file
// ============================================================================

fs.writeFileSync(OUT, JSON.stringify(fixed, null, 2));

console.log(`✅ Wrote ${OUT} (Anchor 0.32.1 compatible format)`);
console.log(`\nSummary:`);
console.log(`  Address: ${fixed.address}`);
console.log(`  Accounts: ${fixed.accounts.map(a => a.name).join(', ')}`);
console.log(`  Types: ${fixed.types.map(t => t.name).join(', ')}`);
console.log(`\nNext steps:`);
console.log(`  1. Review the fixed IDL: cat ${OUT}`);
console.log(`  2. Apply the fix: cp ${OUT} ${IN}`);
console.log(`  3. Test: node scripts/test-real-transfer.js`);
console.log(`\nFor more information, see:`);
console.log(`  - docs/IDL_TROUBLESHOOTING_GUIDE.md`);
console.log(`  - docs/DEBUGGING_PROCESS.md`);
