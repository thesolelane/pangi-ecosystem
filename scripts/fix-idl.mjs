/**
 * Anchor IDL Fixer for Newer Versions (0.30.x, 1.x)
 * 
 * This script converts IDL files to the format expected by newer Anchor versions.
 * 
 * Key transformations:
 * 1. Moves address from metadata.address to top-level address field
 * 2. Promotes account struct definitions from types to inline in accounts
 * 3. Converts {"defined": "Pubkey"} to "publicKey" (camelCase)
 * 
 * Usage:
 *   node scripts/fix-idl.mjs
 *   cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json
 * 
 * Note: This format is for Anchor 0.30.x and 1.x versions.
 * For Anchor 0.32.1, use fix-idl-v0.32.mjs instead.
 * 
 * @see docs/IDL_TROUBLESHOOTING_GUIDE.md for detailed explanation
 * @see docs/DEBUGGING_PROCESS.md for the debugging journey
 */

import fs from 'node:fs';

// Configuration
const IN = 'target/idl/pangi_token.json';
const OUT = 'target/idl/pangi_token.fixed.json';

// Load the IDL file
const idl = JSON.parse(fs.readFileSync(IN, 'utf8'));

// ============================================================================
// TRANSFORMATION 1: Move address to top level
// ============================================================================
// Same as 0.32.1 - all Anchor versions expect address at top level
// ============================================================================

if (!idl.address && idl.metadata?.address) {
  idl.address = idl.metadata.address;
  delete idl.metadata.address;
}

// ============================================================================
// TRANSFORMATION 2: Promote account structs to inline definitions
// ============================================================================
// Newer Anchor versions (0.30.x, 1.x) use inline account type definitions.
//
// Before (0.32.1 style):
// {
//   "accounts": [
//     { "name": "Config", "discriminator": [...] }
//   ],
//   "types": [
//     { "name": "Config", "type": { "kind": "struct", "fields": [...] } }
//   ]
// }
//
// After (newer style):
// {
//   "accounts": [
//     { "name": "Config", "type": { "kind": "struct", "fields": [...] } }
//   ],
//   "types": []
// }
// ============================================================================

idl.accounts ||= [];
idl.types ||= [];

// Identify which types are account types (have matching names in accounts)
const accountNames = new Set((idl.accounts || []).map(a => a.name));

// Map types by name for easy lookup
const typeByName = new Map(idl.types.map(t => [t.name, t]));

// Promote account types from types section to inline in accounts
idl.accounts = idl.accounts.map(acc => {
  // If account doesn't have inline type, look it up in types
  if (!acc.type) {
    const t = typeByName.get(acc.name);
    if (t && t.type?.kind === 'struct') {
      // Add type inline and remove discriminator (not needed in newer versions)
      acc = { name: acc.name, type: t.type };
      typeByName.delete(acc.name); // Remove from types (it's now inline)
    }
  }
  return acc;
});

// Rebuild types array without the promoted account structs
idl.types = [...typeByName.values()];

// ============================================================================
// TRANSFORMATION 3: Convert PublicKey type format
// ============================================================================
// Newer Anchor versions use "publicKey" (camelCase).
//
// This converts:
// - {"defined": "Pubkey"} → "publicKey"
// - "pubkey" → "publicKey"
// ============================================================================

/**
 * Recursively walk the IDL and convert type formats for newer Anchor versions.
 * 
 * @param {*} v - The value to process
 * @returns {*} The processed value with converted types
 */
function walk(v) {
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === 'object') {
    // Convert {"defined": "Pubkey"} to "publicKey"
    if (v.defined && typeof v.defined === 'string' && v.defined.toLowerCase() === 'pubkey') {
      return 'publicKey';
    }
    // Recurse into object properties
    const o = {};
    for (const [k, val] of Object.entries(v)) {
      // Convert "pubkey" to "publicKey"
      if (k === 'type' && val === 'pubkey') {
        o[k] = 'publicKey';
      } else {
        o[k] = walk(val);
      }
    }
    return o;
  }
  return v;
}

const fixed = walk(idl);

// ============================================================================
// Write the fixed IDL to output file
// ============================================================================

fs.writeFileSync(OUT, JSON.stringify(fixed, null, 2));

console.log(`✅ Wrote ${OUT} (Newer Anchor format)`);
console.log(`\nSummary:`);
console.log(`  Address: ${fixed.address}`);
console.log(`  Accounts: ${fixed.accounts.map(a => a.name).join(', ')}`);
console.log(`  Types: ${fixed.types.map(t => t.name).join(', ')}`);
console.log(`\nNext steps:`);
console.log(`  1. Review the fixed IDL: cat ${OUT}`);
console.log(`  2. Apply the fix: cp ${OUT} ${IN}`);
console.log(`  3. Test: node scripts/test-real-transfer.js`);
console.log(`\nNote: This format is for Anchor 0.30.x and 1.x`);
console.log(`For Anchor 0.32.1, use fix-idl-v0.32.mjs instead`);
