# Anchor IDL Quick Reference Card

**One-page reference for fixing Anchor IDL format issues**

---

## 🚨 Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read properties of undefined (reading '_bn')` | Missing `address` at top level | Move `metadata.address` → `address` |
| `Account not found: <name>` | Account type not in `types` section | Move struct to `types` (0.32.1) |
| `Cannot use 'in' operator in publicKey` | Wrong PublicKey format | Use `"pubkey"` (0.32.1) or `"publicKey"` (newer) |
| `The first argument must be of type string` | Missing discriminator | Add discriminator array (0.32.1) |

---

## ⚡ Quick Fix

```bash
# 1. Check version
npm list @coral-xyz/anchor

# 2. Run fixer
node scripts/fix-idl-v0.32.mjs  # For 0.32.1
# OR
node scripts/fix-idl.mjs         # For 0.30.x, 1.x

# 3. Apply
cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json

# 4. Test
node scripts/test-real-transfer.js
```

---

## 📋 Format Comparison

### Anchor 0.32.1
```json
{
  "address": "...",
  "accounts": [
    {"name": "Config", "discriminator": [155, 12, ...]}
  ],
  "types": [
    {"name": "Config", "type": {"kind": "struct", "fields": [
      {"name": "authority", "type": "pubkey"}
    ]}}
  ]
}
```

### Anchor 0.30.x / 1.x
```json
{
  "address": "...",
  "accounts": [
    {"name": "Config", "type": {"kind": "struct", "fields": [
      {"name": "authority", "type": "publicKey"}
    ]}}
  ],
  "types": []
}
```

---

## 🔧 Manual Fixes

### Fix 1: Move Address
```bash
# Before: "metadata": {"address": "..."}
# After:  "address": "..."
jq '.address = .metadata.address | del(.metadata.address)' idl.json
```

### Fix 2: Generate Discriminator
```javascript
import crypto from 'node:crypto';
const hash = crypto.createHash('sha256');
hash.update('account:TaxConfig');
Array.from(hash.digest().slice(0, 8));
// [38, 187, 35, 231, 115, 102, 30, 82]
```

### Fix 3: Convert PublicKey Type
```bash
# For 0.32.1
sed -i 's/"type": "publicKey"/"type": "pubkey"/g' idl.json

# For newer
sed -i 's/"type": "pubkey"/"type": "publicKey"/g' idl.json
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `docs/IDL_FIX_SUMMARY.md` | Complete overview |
| `docs/IDL_TROUBLESHOOTING_GUIDE.md` | Error reference |
| `docs/DEBUGGING_PROCESS.md` | Case study |
| `docs/examples/idl-before-after.md` | Real examples |
| `scripts/README_IDL_FIXER.md` | Script usage |

---

## 🧪 Testing

```bash
# Simple test (no IDL parsing)
node scripts/test-connection.js

# Full test (with IDL)
node scripts/test-real-transfer.js

# Verify structure
cat target/idl/pangi_token.json | jq '{
  address,
  accounts: .accounts | map({name, has_discriminator: (.discriminator != null)}),
  types: .types | map(.name)
}'
```

---

## 🎯 Decision Tree

```
IDL not loading?
├─ Check Anchor version
│  ├─ 0.32.1 → Use fix-idl-v0.32.mjs
│  └─ 0.30.x/1.x → Use fix-idl.mjs
│
├─ Error: "_bn"?
│  └─ Move address to top level
│
├─ Error: "Account not found"?
│  └─ Move account struct to types (0.32.1)
│
├─ Error: "'in' operator"?
│  └─ Change "publicKey" → "pubkey" (0.32.1)
│
└─ Error: "type string"?
   └─ Add discriminator (0.32.1)
```

---

## 💾 Backup & Restore

```bash
# Backup original
cp target/idl/pangi_token.json target/idl/pangi_token.json.backup

# Restore if needed
cp target/idl/pangi_token.json.backup target/idl/pangi_token.json
```

---

## 🔍 Validation

```bash
# Check address location
jq 'has("address")' idl.json

# Check account discriminators (0.32.1)
jq '.accounts[] | {name, has_disc: has("discriminator")}' idl.json

# Check type format
jq '.types[0].type.fields[] | select(.type == "pubkey" or .type == "publicKey")' idl.json
```

---

## 📞 Help

1. **Self-service:** Check `docs/IDL_TROUBLESHOOTING_GUIDE.md`
2. **Examples:** See `docs/examples/idl-before-after.md`
3. **Process:** Read `docs/DEBUGGING_PROCESS.md`
4. **Community:** GitHub Issues, Solana Stack Exchange

---

## ✅ Checklist

- [ ] Backed up original IDL
- [ ] Checked Anchor version
- [ ] Ran appropriate fix script
- [ ] Reviewed changes with diff
- [ ] Applied fix
- [ ] Tested with test-connection.js
- [ ] Tested with test-real-transfer.js
- [ ] Verified program loads
- [ ] Documented any new issues

---

**Print this page for quick reference!**

For complete documentation, see `docs/README.md`
