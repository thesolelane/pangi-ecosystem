# IDL Fixer Scripts

These scripts fix IDL format incompatibilities between different Anchor versions.

## Scripts

### `fix-idl.mjs` - Newer Anchor Format (0.30.x, 1.x)
Converts IDL to the newer format with:
- Inline account type definitions in `accounts` section
- `"publicKey"` (camelCase) type
- No discriminator needed

```bash
node scripts/fix-idl.mjs
```

**Output:** `target/idl/pangi_token.fixed.json`

### `fix-idl-v0.32.mjs` - Anchor 0.32.1 Format ✅ (Current)
Converts IDL to Anchor 0.32.1 compatible format with:
- Account structs in `types` section
- `"pubkey"` (lowercase) type
- Discriminator array in `accounts` section

```bash
node scripts/fix-idl-v0.32.mjs
```

**Output:** `target/idl/pangi_token.fixed.json`

## What the Scripts Fix

### 1. Address Location
**Before:**
```json
{
  "metadata": {
    "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA"
  }
}
```

**After:**
```json
{
  "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA",
  "metadata": {}
}
```

### 2. Account Structure (Anchor 0.32.1)
**Before:**
```json
{
  "accounts": [
    {
      "name": "TaxConfig",
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
      "name": "TaxConfig",
      "discriminator": [38, 187, 35, 231, 115, 102, 30, 82]
    }
  ],
  "types": [
    {
      "name": "TaxConfig",
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

### 3. PublicKey Type Format
- Anchor 0.32.1: `"pubkey"` (lowercase)
- Newer versions: `"publicKey"` (camelCase)

## Usage

1. **Check your Anchor version:**
   ```bash
   npm list @coral-xyz/anchor
   ```

2. **Run the appropriate fixer:**
   - For Anchor 0.32.1: `node scripts/fix-idl-v0.32.mjs`
   - For newer versions: `node scripts/fix-idl.mjs`

3. **Replace the original IDL:**
   ```bash
   cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json
   ```

4. **Test the program:**
   ```bash
   node scripts/test-real-transfer.js
   ```

## Current Setup

- **Anchor Version:** 0.32.1
- **IDL Format:** Anchor 0.32.1 compatible
- **Status:** ✅ Working

## Discriminator Generation

The discriminator is an 8-byte array generated from the SHA256 hash of `"account:<AccountName>"`. For example:
- `"account:TaxConfig"` → `[38, 187, 35, 231, 115, 102, 30, 82]`

This uniquely identifies the account type in the program.
