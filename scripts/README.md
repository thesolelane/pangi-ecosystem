# PANGI Scripts

Utility scripts for development, testing, and verification.

## Security Verification

### `verify-security.js` - Security Feature Verification ✅

Verifies that security features are properly implemented across the project.

**Usage:**
```bash
# Run security verification
npm run check:security

# Or directly
node scripts/verify-security.js

# With debug output
DEBUG=1 node scripts/verify-security.js
```

**What it checks:**
- ✅ Project structure (all required files present)
- ✅ Security documentation (16 security docs)
- ✅ Dependencies (Anchor, Solana Web3.js)
- ✅ Build artifacts (IDL files)
- ✅ Security features in programs:
  - Slippage protection
  - Reentrancy guards
  - Overflow protection
  - Timelocks
  - Reward caps
  - Evolution cooldowns
  - Access control
  - Input validation
- ✅ Frontend security:
  - Transaction simulation
  - Transaction preview
  - Error handling
  - Input validation

**Exit codes:**
- `0` - All checks passed or only warnings
- `1` - Critical checks failed

**Rate limiting:**
- Can only run once per minute to prevent spam
- Creates `.security-verification-last-run` file

**Security features:**
- Path traversal protection
- File type whitelist
- File size limits (10MB max)
- Prototype pollution protection
- Safe error handling

---

## Development Scripts

### `test-real-transfer.js` - Test Token Transfers
```bash
npm run test:real
```

### `test-connection.js` - Test Solana Connection
```bash
node scripts/test-connection.js
```

---

## Deployment Scripts

### `deployment-checklist.sh` - Pre-deployment Checks
```bash
npm run check:deployment
```

### `check-program-status.sh` - Check Program Status
```bash
npm run check:programs
```

### `get-program-ids.sh` - Get Program IDs
```bash
npm run get:program-ids
```

### `verify-devnet.sh` - Verify Devnet Deployment
```bash
npm run verify:devnet
```

---

## Setup Scripts

### `setup-token-accounts.sh` - Setup Token Accounts
```bash
npm run setup:accounts
```

### `test-token-transfer.sh` - Test Token Transfer
```bash
npm run test:transfer
```

---

## IDL Fixer Scripts

See [README_IDL_FIXER.md](./README_IDL_FIXER.md) for details.

### `fix-idl.mjs` - Newer Anchor Format
```bash
node scripts/fix-idl.mjs
```

### `fix-idl-v0.32.mjs` - Anchor 0.32.1 Format (Current)
```bash
node scripts/fix-idl-v0.32.mjs
```

---

## Script Permissions

All scripts should be executable:
```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Check

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run check:security
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run check:security
if [ $? -ne 0 ]; then
  echo "Security verification failed. Commit aborted."
  exit 1
fi
```

---

## Troubleshooting

### Security Verification Issues

**"Please wait X seconds before running again"**
- Rate limiting is active
- Wait the specified time or delete `.security-verification-last-run`

**"Missing required files"**
- Run `anchor build` to generate IDL files
- Ensure all programs are present in `programs/` directory

**"Missing security documentation"**
- Check that `docs/` directory contains all security documents
- See `docs/SECURITY_INDEX.md` for complete list

**"Security features not implemented"**
- Review the specific feature mentioned
- Check corresponding security review document in `docs/`
- Implement missing patterns from security documentation

---

## Development

### Adding New Checks

Edit `scripts/verify-security.js` and add to the checks array:

```javascript
checkNewFeature() {
  // Your check logic
  return {
    name: 'Feature Name',
    status: 'PASS' | 'FAIL' | 'WARN',
    details: 'Description',
    missing: ['item1', 'item2'] // optional
  };
}
```

Then add to `runAllChecks()`:
```javascript
const checks = [
  // ... existing checks
  this.checkNewFeature()
];
```

---

## Security

All scripts follow security best practices:
- ✅ Path traversal protection
- ✅ File type whitelisting
- ✅ File size limits
- ✅ Rate limiting
- ✅ Safe error handling
- ✅ No command execution
- ✅ Read-only operations

See `docs/SAFE_VERIFICATION_REVIEW.md` for security analysis.

---

## Support

For issues or questions:
1. Check script output for suggestions
2. Review relevant documentation in `docs/`
3. Check GitHub issues
4. Contact PANGI team

---

**Last Updated:** 2025-01-07  
**Version:** 1.0
