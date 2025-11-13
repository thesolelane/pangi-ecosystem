# IDL Format Issue - RESOLVED ✅

## Automated Fix Available

Use the IDL fixer script to automatically convert IDL formats:

```bash
# For Anchor 0.32.1 (current version)
node scripts/fix-idl-v0.32.mjs

# Apply the fix
cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json

# Test
node scripts/test-real-transfer.js
```

See `scripts/README_IDL_FIXER.md` for details.

---

## Problem (FIXED)

The IDL file (`target/idl/pangi_token.json`) had format incompatibilities with Anchor's BorshAccountsCoder.

## Issues Fixed

1. ✅ **Address location**: Moved from `metadata.address` to top-level `address` field
2. ✅ **PublicKey type**: Changed from `"publicKey"` to `"pubkey"` (lowercase)
3. ✅ **Account discriminator**: Added required discriminator array to account definition
4. ✅ **Metadata structure**: Moved address out and kept metadata for description only

## Changes Made

### Key Fixes:
1. **Address field**: Moved from `metadata.address` to top-level `address`
2. **PublicKey type**: Changed from `"publicKey"` to `"pubkey"` (lowercase) in types section
3. **Account discriminator**: Added required 8-byte discriminator array
4. **Dual definition**: Account name in `accounts` section, full struct in `types` section

### Correct IDL Structure:

```json
{
  "version": "0.1.0",
  "name": "pangi_token",
  "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA",  // ← Top-level, not in metadata
  "instructions": [...],
  "accounts": [
    {
      "name": "TaxConfig",
      "discriminator": [116, 97, 120, 95, 99, 111, 110, 102]  // ← Required 8-byte array
    }
  ],
  "types": [
    {
      "name": "TaxConfig",  // ← Must match account name
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "pubkey"},  // ← Lowercase "pubkey"
          {"name": "p2pTaxRate", "type": "u16"},
          {"name": "conservationFund", "type": "pubkey"}  // ← Lowercase "pubkey"
        ]
      }
    }
  ],
  "metadata": {  // ← Optional, at end
    "description": "PANGI Token Program with tax functionality"
  }
}
```

## Current Status

- ✅ Program is deployed on devnet at: `BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA`
- ✅ Connection test works
- ✅ Full Anchor Program integration working
- ✅ IDL loads successfully
- ✅ Instructions accessible: `transferWithTax`, `initializeTaxConfig`
