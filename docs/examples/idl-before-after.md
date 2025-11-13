# IDL Format Examples - Before and After

This document shows real examples of IDL transformations for different Anchor versions.

## Example 1: PANGI Token Program (Anchor 0.32.1)

### Before (Original IDL)

```json
{
  "version": "0.1.0",
  "name": "pangi_token",
  "metadata": {
    "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA"
  },
  "instructions": [
    {
      "name": "transfer_with_tax",
      "accounts": [
        {"name": "from", "isMut": true, "isSigner": false},
        {"name": "to", "isMut": true, "isSigner": false},
        {"name": "conservationFund", "isMut": true, "isSigner": false},
        {"name": "authority", "isMut": false, "isSigner": true},
        {"name": "tokenProgram", "isMut": false, "isSigner": false},
        {"name": "taxConfig", "isMut": false, "isSigner": false}
      ],
      "args": [
        {"name": "amount", "type": "u64"}
      ]
    },
    {
      "name": "initialize_tax_config",
      "accounts": [
        {"name": "taxConfig", "isMut": true, "isSigner": false},
        {"name": "conservationFund", "isMut": false, "isSigner": false},
        {"name": "authority", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": [
        {"name": "p2pTaxRate", "type": "u16"},
        {"name": "exchangeTaxRate", "type": "u16"},
        {"name": "whaleTaxRate", "type": "u16"},
        {"name": "whaleThreshold", "type": "u64"}
      ]
    }
  ],
  "accounts": [
    {
      "name": "TaxConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"},
          {"name": "p2pTaxRate", "type": "u16"},
          {"name": "exchangeTaxRate", "type": "u16"},
          {"name": "whaleTaxRate", "type": "u16"},
          {"name": "whaleTransferThreshold", "type": "u64"},
          {"name": "maxTaxPerTransfer", "type": "u64"},
          {"name": "conservationFund", "type": "publicKey"},
          {"name": "lastUpdated", "type": "i64"}
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransferType",
      "type": {
        "kind": "enum",
        "variants": [
          {"name": "PeerToPeer"},
          {"name": "ExchangeDeposit"},
          {"name": "ConservationReward"},
          {"name": "LargeWhale"}
        ]
      }
    }
  ]
}
```

### After (Fixed for Anchor 0.32.1)

```json
{
  "version": "0.1.0",
  "name": "pangi_token",
  "address": "BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA",
  "instructions": [
    {
      "name": "transfer_with_tax",
      "accounts": [
        {"name": "from", "isMut": true, "isSigner": false},
        {"name": "to", "isMut": true, "isSigner": false},
        {"name": "conservationFund", "isMut": true, "isSigner": false},
        {"name": "authority", "isMut": false, "isSigner": true},
        {"name": "tokenProgram", "isMut": false, "isSigner": false},
        {"name": "taxConfig", "isMut": false, "isSigner": false}
      ],
      "args": [
        {"name": "amount", "type": "u64"}
      ]
    },
    {
      "name": "initialize_tax_config",
      "accounts": [
        {"name": "taxConfig", "isMut": true, "isSigner": false},
        {"name": "conservationFund", "isMut": false, "isSigner": false},
        {"name": "authority", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": [
        {"name": "p2pTaxRate", "type": "u16"},
        {"name": "exchangeTaxRate", "type": "u16"},
        {"name": "whaleTaxRate", "type": "u16"},
        {"name": "whaleThreshold", "type": "u64"}
      ]
    }
  ],
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
          {"name": "authority", "type": "pubkey"},
          {"name": "p2pTaxRate", "type": "u16"},
          {"name": "exchangeTaxRate", "type": "u16"},
          {"name": "whaleTaxRate", "type": "u16"},
          {"name": "whaleTransferThreshold", "type": "u64"},
          {"name": "maxTaxPerTransfer", "type": "u64"},
          {"name": "conservationFund", "type": "pubkey"},
          {"name": "lastUpdated", "type": "i64"}
        ]
      }
    },
    {
      "name": "TransferType",
      "type": {
        "kind": "enum",
        "variants": [
          {"name": "PeerToPeer"},
          {"name": "ExchangeDeposit"},
          {"name": "ConservationReward"},
          {"name": "LargeWhale"}
        ]
      }
    }
  ],
  "metadata": {
    "description": "PANGI Token Program with tax functionality"
  }
}
```

### Key Changes

1. **Address moved to top level**
   - Before: `"metadata": { "address": "..." }`
   - After: `"address": "..."` at top level

2. **Account definition restructured**
   - Before: Inline type in accounts section
   - After: Name + discriminator in accounts, full type in types section

3. **Discriminator added**
   - Generated from SHA256("account:TaxConfig")
   - First 8 bytes: `[38, 187, 35, 231, 115, 102, 30, 82]`

4. **PublicKey type changed**
   - Before: `"type": "publicKey"` (camelCase)
   - After: `"type": "pubkey"` (lowercase)

---

## Example 2: Simple Config Account

### Before

```json
{
  "version": "0.1.0",
  "name": "my_program",
  "metadata": {
    "address": "ExampleProgramId11111111111111111111111111"
  },
  "accounts": [
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"},
          {"name": "bump", "type": "u8"},
          {"name": "feeBps", "type": "u16"}
        ]
      }
    }
  ],
  "types": []
}
```

### After (Anchor 0.32.1)

```json
{
  "version": "0.1.0",
  "name": "my_program",
  "address": "ExampleProgramId11111111111111111111111111",
  "accounts": [
    {
      "name": "Config",
      "discriminator": [155, 12, 170, 224, 30, 250, 204, 130]
    }
  ],
  "types": [
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "pubkey"},
          {"name": "bump", "type": "u8"},
          {"name": "feeBps", "type": "u16"}
        ]
      }
    }
  ],
  "metadata": {}
}
```

---

## Example 3: Multiple Accounts

### Before

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
    },
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "mint", "type": "publicKey"},
          {"name": "treasurer", "type": "publicKey"}
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "feeBps", "type": "u16"}
        ]
      }
    }
  ]
}
```

### After (Anchor 0.32.1)

```json
{
  "accounts": [
    {
      "name": "Config",
      "discriminator": [155, 12, 170, 224, 30, 250, 204, 130]
    },
    {
      "name": "Vault",
      "discriminator": [211, 8, 232, 43, 2, 152, 117, 119]
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
    },
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "mint", "type": "pubkey"},
          {"name": "treasurer", "type": "pubkey"}
        ]
      }
    },
    {
      "name": "InitArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "feeBps", "type": "u16"}
        ]
      }
    }
  ]
}
```

**Note:** InitArgs stays in types because it's not an account type - it's just a struct used for instruction arguments.

---

## Discriminator Generation Examples

```javascript
import crypto from 'node:crypto';

function generateDiscriminator(accountName) {
  const hash = crypto.createHash('sha256');
  hash.update(`account:${accountName}`);
  const digest = hash.digest();
  return Array.from(digest.slice(0, 8));
}

// Examples:
generateDiscriminator('Config')
// [155, 12, 170, 224, 30, 250, 204, 130]

generateDiscriminator('TaxConfig')
// [38, 187, 35, 231, 115, 102, 30, 82]

generateDiscriminator('Vault')
// [211, 8, 232, 43, 2, 152, 117, 119]

generateDiscriminator('UserAccount')
// [211, 33, 136, 16, 186, 110, 242, 127]
```

---

## Type Format Comparison

| Type | Anchor 0.32.1 | Newer Versions |
|------|---------------|----------------|
| PublicKey | `"pubkey"` | `"publicKey"` |
| String | `"string"` | `"string"` |
| u8 | `"u8"` | `"u8"` |
| u16 | `"u16"` | `"u16"` |
| u32 | `"u32"` | `"u32"` |
| u64 | `"u64"` | `"u64"` |
| u128 | `"u128"` | `"u128"` |
| i8 | `"i8"` | `"i8"` |
| i16 | `"i16"` | `"i16"` |
| i32 | `"i32"` | `"i32"` |
| i64 | `"i64"` | `"i64"` |
| i128 | `"i128"` | `"i128"` |
| bool | `"bool"` | `"bool"` |
| bytes | `"bytes"` | `"bytes"` |

**Only PublicKey differs between versions!**

---

## Testing Your Fixed IDL

After applying fixes, test with:

```bash
# Simple connection test
node scripts/test-connection.js

# Full program test
node scripts/test-real-transfer.js

# Verify structure
cat target/idl/your_program.json | jq '{
  address,
  accounts: .accounts | map({name, has_discriminator: (.discriminator != null)}),
  types: .types | map(.name)
}'
```

Expected output for Anchor 0.32.1:
```json
{
  "address": "YourProgramId...",
  "accounts": [
    {"name": "Config", "has_discriminator": true}
  ],
  "types": ["Config", "OtherTypes"]
}
```
