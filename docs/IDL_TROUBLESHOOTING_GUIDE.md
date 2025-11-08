# Anchor IDL Troubleshooting Guide

A comprehensive guide to diagnosing and fixing Anchor IDL format issues across different versions.

## Table of Contents
- [Common Errors](#common-errors)
- [Diagnostic Process](#diagnostic-process)
- [Version-Specific Formats](#version-specific-formats)
- [Automated Fixes](#automated-fixes)
- [Manual Fixes](#manual-fixes)
- [Testing](#testing)

---

## Common Errors

### Error 1: "Cannot read properties of undefined (reading '_bn')"

**Symptom:**
```
TypeError: Cannot read properties of undefined (reading '_bn')
    at isPublicKeyData
    at new PublicKey
    at translateAddress
    at new Program
```

**Cause:** The `address` field is missing or in the wrong location.

**Fix:**
```json
// ❌ Wrong
{
  "metadata": {
    "address": "..."
  }
}

// ✅ Correct
{
  "address": "...",
  "metadata": {}
}
```

---

### Error 2: "Account not found: taxConfig"

**Symptom:**
```
Error: Account not found: taxConfig
    at BorshAccountsCoder
```

**Cause:** Account type definition is missing from the `types` section (Anchor 0.32.1).

**Fix:** Ensure account struct is defined in `types` section with matching name:

```json
{
  "accounts": [
    {
      "name": "TaxConfig",
      "discriminator": [38, 187, 35, 231, 115, 102, 30, 82]
    }
  ],
  "types": [
    {
      "name": "TaxConfig",  // ← Must match account name
      "type": {
        "kind": "struct",
        "fields": [...]
      }
    }
  ]
}
```

---

### Error 3: "Cannot use 'in' operator to search for 'option' in publicKey"

**Symptom:**
```
TypeError: Cannot use 'in' operator to search for 'option' in publicKey
    at IdlCoder.fieldLayout
```

**Cause:** Wrong type format for PublicKey fields.

**Fix:**
```json
// Anchor 0.32.1
{"name": "authority", "type": "pubkey"}  // ← lowercase

// Anchor 0.30.x, 1.x
{"name": "authority", "type": "publicKey"}  // ← camelCase
```

---

### Error 4: "The first argument must be of type string or an instance of Buffer"

**Symptom:**
```
TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be of type string...
    at BorshAccountsCoder.accountDiscriminator
```

**Cause:** Missing `discriminator` field in account definition (Anchor 0.32.1).

**Fix:**
```json
{
  "accounts": [
    {
      "name": "TaxConfig",
      "discriminator": [38, 187, 35, 231, 115, 102, 30, 82]  // ← Required
    }
  ]
}
```

---

## Diagnostic Process

### Step 1: Check Anchor Version

```bash
npm list @coral-xyz/anchor
```

**Output example:**
```
pangi-ecosystem@1.0.0
└── @coral-xyz/anchor@0.32.1
```

### Step 2: Identify IDL Format

Check your current IDL structure:

```bash
cat target/idl/your_program.json | jq '{
  address: .address,
  metadata_address: .metadata.address,
  accounts: .accounts[0] | {name, has_type: (.type != null), has_discriminator: (.discriminator != null)},
  types: .types | map(.name)
}'
```

### Step 3: Compare Against Expected Format

**Anchor 0.32.1 Format:**
```json
{
  "address": "...",                    // ← Top level
  "accounts": [
    {
      "name": "Config",
      "discriminator": [...]           // ← Required
    }
  ],
  "types": [
    {
      "name": "Config",                // ← Matches account name
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "pubkey"}  // ← lowercase
        ]
      }
    }
  ]
}
```

**Anchor 0.30.x / 1.x Format:**
```json
{
  "address": "...",                    // ← Top level
  "accounts": [
    {
      "name": "Config",
      "type": {                        // ← Inline type definition
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"}  // ← camelCase
        ]
      }
    }
  ],
  "types": []                          // ← Account types not here
}
```

### Step 4: Run Diagnostic Script

```bash
node scripts/test-connection.js
```

This simple test verifies:
- Connection to Solana
- Program deployment
- Basic account info

If this works but full Program loading fails, it's an IDL format issue.

---

## Version-Specific Formats

### Anchor 0.32.1

**Key Characteristics:**
- Account structs in `types` section
- Discriminator required in `accounts` section
- `"pubkey"` (lowercase) for PublicKey fields
- Separate account name and type definition

**Example:**
```json
{
  "version": "0.1.0",
  "name": "my_program",
  "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA",
  "instructions": [...],
  "accounts": [
    {
      "name": "Config",
      "discriminator": [116, 97, 120, 95, 99, 111, 110, 102]
    }
  ],
  "types": [
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "pubkey"},
          {"name": "bump", "type": "u8"}
        ]
      }
    }
  ]
}
```

### Anchor 0.30.x / 1.x

**Key Characteristics:**
- Inline account type definitions
- No discriminator needed
- `"publicKey"` (camelCase) for PublicKey fields
- Combined account name and type

**Example:**
```json
{
  "version": "0.1.0",
  "name": "my_program",
  "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA",
  "instructions": [...],
  "accounts": [
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"},
          {"name": "bump", "type": "u8"}
        ]
      }
    }
  ],
  "types": []
}
```

---

## Automated Fixes

### For Anchor 0.32.1 (Current)

```bash
# Run the fixer
node scripts/fix-idl-v0.32.mjs

# Apply the fix
cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json

# Test
node scripts/test-real-transfer.js
```

**What it does:**
1. Moves `metadata.address` → top-level `address`
2. Generates discriminators for accounts
3. Moves inline account types to `types` section
4. Converts `"publicKey"` → `"pubkey"`

### For Newer Anchor Versions

```bash
# Run the fixer
node scripts/fix-idl.mjs

# Apply the fix
cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json

# Test
node scripts/test-real-transfer.js
```

**What it does:**
1. Moves `metadata.address` → top-level `address`
2. Promotes account structs from `types` to inline in `accounts`
3. Converts `{"defined": "Pubkey"}` → `"publicKey"`

---

## Manual Fixes

### Fix 1: Move Address to Top Level

**Before:**
```json
{
  "version": "0.1.0",
  "name": "my_program",
  "metadata": {
    "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA"
  }
}
```

**After:**
```json
{
  "version": "0.1.0",
  "name": "my_program",
  "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA",
  "metadata": {}
}
```

### Fix 2: Add Discriminator (Anchor 0.32.1)

Generate discriminator using Node.js:

```javascript
import crypto from 'node:crypto';

function generateDiscriminator(accountName) {
  const hash = crypto.createHash('sha256');
  hash.update(`account:${accountName}`);
  const digest = hash.digest();
  return Array.from(digest.slice(0, 8));
}

console.log(generateDiscriminator('TaxConfig'));
// Output: [38, 187, 35, 231, 115, 102, 30, 82]
```

Add to IDL:
```json
{
  "accounts": [
    {
      "name": "TaxConfig",
      "discriminator": [38, 187, 35, 231, 115, 102, 30, 82]
    }
  ]
}
```

### Fix 3: Move Account Type to Types Section (Anchor 0.32.1)

**Before:**
```json
{
  "accounts": [
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"}
        ]
      }
    }
  ],
  "types": []
}
```

**After:**
```json
{
  "accounts": [
    {
      "name": "Config",
      "discriminator": [...]
    }
  ],
  "types": [
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "pubkey"}
        ]
      }
    }
  ]
}
```

### Fix 4: Convert PublicKey Type Format

**For Anchor 0.32.1:**
```bash
# Find and replace in IDL
sed -i 's/"type": "publicKey"/"type": "pubkey"/g' target/idl/my_program.json
```

**For newer versions:**
```bash
# Find and replace in IDL
sed -i 's/"type": "pubkey"/"type": "publicKey"/g' target/idl/my_program.json
```

---

## Testing

### Test 1: Simple Connection Test

```bash
node scripts/test-connection.js
```

**Expected output:**
```
✅ Connected to Solana devnet
✅ Wallet loaded
✅ Program is deployed
```

### Test 2: Full Program Loading

```bash
node scripts/test-real-transfer.js
```

**Expected output:**
```
✅ Program loaded: pangiToken
✅ Program ID: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
✅ Instructions: transferWithTax, initializeTaxConfig
```

### Test 3: Verify IDL Structure

```bash
cat target/idl/my_program.json | jq '{
  version,
  name,
  address,
  account_count: (.accounts | length),
  type_count: (.types | length),
  first_account: .accounts[0],
  first_type: .types[0].name
}'
```

---

## Quick Reference

| Error Message | Anchor Version | Fix |
|--------------|----------------|-----|
| `Cannot read properties of undefined (reading '_bn')` | All | Move `address` to top level |
| `Account not found: <name>` | 0.32.1 | Add type to `types` section |
| `Cannot use 'in' operator` | 0.32.1 | Change `publicKey` → `pubkey` |
| `The first argument must be of type string` | 0.32.1 | Add discriminator |

---

## Resources

- **Anchor Documentation:** https://www.anchor-lang.com/
- **IDL Specification:** https://www.anchor-lang.com/docs/idl-spec
- **Fix Scripts:** `scripts/fix-idl-v0.32.mjs`, `scripts/fix-idl.mjs`
- **Test Scripts:** `scripts/test-connection.js`, `scripts/test-real-transfer.js`

---

## Contributing

Found a new IDL issue? Please document:
1. Anchor version
2. Error message (full stack trace)
3. IDL structure (before/after)
4. Fix applied

This helps others troubleshoot similar issues!
