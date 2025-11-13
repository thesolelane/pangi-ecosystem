# PANGI Ecosystem Documentation

Welcome to the PANGI ecosystem documentation! This comprehensive guide covers everything from getting started as a user to building on PANGI as a developer.

## 🌟 What is PANGI?

PANGI is an evolving NFT ecosystem built on Solana that combines:
- **🖼️ Dynamic NFTs** - NFTs that evolve through 5 tiers (Egg → Baby → Juvenile → Adult → Legendary)
- **🔒 Staking Vaults** - Stake NFTs to earn PANGI tokens and evolution points
- **💰 Token Distribution** - 63M PANGI distributed across 25 special NFTs
- **🐾 Conservation Fund** - Support real-world pangolin conservation
- **💎 Dynamic Tax System** - Configurable transfer taxes funding ecosystem growth

---

## 📚 Documentation Index

### 🎮 User Guides

Perfect for users who want to interact with PANGI:

- **[Getting Started](./user-guide/getting-started.md)** - Introduction to PANGI and quick start guide
- **[Wallet Setup](./user-guide/wallet-setup.md)** - Configure your Solana wallet (Phantom/Solflare)
- **[Staking Guide](./user-guide/staking-guide.md)** *(Coming Soon)* - Stake NFTs and earn rewards
- **[Governance Guide](./user-guide/governance-guide.md)** *(Coming Soon)* - Participate in protocol governance
- **[FAQ](./user-guide/faq.md)** *(Coming Soon)* - Frequently asked questions

### 👨‍💻 Developer Documentation

For developers building on or integrating with PANGI:

- **[Architecture](./developer-docs/architecture.md)** - System design and technical overview
- **[Program Reference](./developer-docs/program-reference.md)** - Complete API reference for all programs
- **[Frontend Integration](./developer-docs/frontend-integration.md)** *(Coming Soon)* - Build dApps with PANGI
- **[API Reference](./developer-docs/api-reference.md)** *(Coming Soon)* - TypeScript SDK documentation
- **[Testing Guide](./developer-docs/testing.md)** *(Coming Soon)* - Write and run tests

### 🚀 Deployment Guides

Step-by-step deployment instructions:

- **[Local Development](./deployment/local-development.md)** - Set up your development environment
- **[Devnet Deployment](./deployment/devnet-deployment.md)** - Deploy to Solana Devnet
- **[Mainnet Deployment](./deployment/mainnet-deployment.md)** *(Coming Soon)* - Production deployment
- **[Troubleshooting](./deployment/troubleshooting.md)** *(Coming Soon)* - Common issues and solutions

### 🔧 Technical Troubleshooting

Advanced debugging and issue resolution:

- **[IDL Fix Summary](./IDL_FIX_SUMMARY.md)** - Complete overview of the IDL format issue and solution
- **[IDL Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md)** - Comprehensive error reference with solutions
- **[Debugging Process](./DEBUGGING_PROCESS.md)** - Step-by-step case study of how we solved the IDL issue
- **[Script Usage Guide](../scripts/README_IDL_FIXER.md)** - How to use the automated fix scripts
- **[Before/After Examples](./examples/idl-before-after.md)** - Real-world IDL transformations

### 📖 Project Documentation

- **[Main README](../README.md)** - Project overview
- **[Scripts Documentation](../README_SCRIPTS.md)** - All available scripts
- **[Quick Start Guide](../QUICK_START.md)** - Get started quickly
- **[Deployment Guide](../DEPLOYMENT_GUIDE.md)** - Deploy to devnet/mainnet

---

## 🔧 Tools & Scripts

### IDL Fixers
```bash
# For Anchor 0.32.1
node scripts/fix-idl-v0.32.mjs

# For Anchor 0.30.x, 1.x
node scripts/fix-idl.mjs
```

### Test Scripts
```bash
# Simple connection test
node scripts/test-connection.js

# Full program test
node scripts/test-real-transfer.js
```

---

## 🎯 Common Tasks

### Fix IDL Format Issues

1. **Check Anchor version:**
   ```bash
   npm list @coral-xyz/anchor
   ```

2. **Run appropriate fixer:**
   ```bash
   node scripts/fix-idl-v0.32.mjs  # For 0.32.1
   ```

3. **Apply fix:**
   ```bash
   cp target/idl/pangi_token.fixed.json target/idl/pangi_token.json
   ```

4. **Test:**
   ```bash
   node scripts/test-real-transfer.js
   ```

### Debug IDL Errors

1. **Start with simple test:**
   ```bash
   node scripts/test-connection.js
   ```

2. **Check IDL structure:**
   ```bash
   cat target/idl/pangi_token.json | jq '{address, accounts: .accounts[0], types: .types | map(.name)}'
   ```

3. **Compare with examples:**
   ```bash
   cat docs/examples/idl-before-after.md
   ```

4. **Look up error in troubleshooting guide:**
   ```bash
   grep "your error message" docs/IDL_TROUBLESHOOTING_GUIDE.md
   ```

---

## 📖 Documentation Structure

```
docs/
├── README.md                           # This file - documentation index
├── IDL_FIX_SUMMARY.md                 # Complete overview and quick start
├── IDL_TROUBLESHOOTING_GUIDE.md       # Error reference and solutions
├── DEBUGGING_PROCESS.md               # Case study and debugging techniques
└── examples/
    └── idl-before-after.md            # Real-world transformation examples

scripts/
├── fix-idl-v0.32.mjs                  # Fixer for Anchor 0.32.1
├── fix-idl.mjs                        # Fixer for newer Anchor versions
├── test-connection.js                 # Simple connectivity test
├── test-real-transfer.js              # Full program integration test
└── README_IDL_FIXER.md                # Script usage guide

Root Documentation:
├── README.md                          # Project overview
├── README_SCRIPTS.md                  # All available scripts
├── QUICK_START.md                     # Quick start guide
├── DEPLOYMENT_GUIDE.md                # Deployment instructions
├── DEVNET_SETUP.md                    # Devnet configuration
├── DEVNET_TESTING.md                  # Testing on devnet
└── IDL_ISSUE.md                       # Quick IDL reference
```

---

## 🚀 Getting Started

### New to the Project?

1. Read [IDL Fix Summary](./IDL_FIX_SUMMARY.md) for overview
2. Check [Quick Start Guide](../QUICK_START.md) for setup
3. Review [Scripts Documentation](../README_SCRIPTS.md) for available tools

### Experiencing IDL Issues?

1. Check [IDL Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md)
2. Run the appropriate fix script
3. Review [Before/After Examples](./examples/idl-before-after.md)

### Want to Understand the Problem?

1. Read [Debugging Process](./DEBUGGING_PROCESS.md)
2. Study the [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md)
3. Examine [Real Examples](./examples/idl-before-after.md)

---

## 🔍 Quick Reference

### Error Messages

| Error | Document | Section |
|-------|----------|---------|
| `Cannot read properties of undefined (reading '_bn')` | [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md) | Error 1 |
| `Account not found: <name>` | [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md) | Error 2 |
| `Cannot use 'in' operator` | [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md) | Error 3 |
| `The first argument must be of type string` | [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md) | Error 4 |

### Anchor Versions

| Version | Format | Script | Documentation |
|---------|--------|--------|---------------|
| 0.32.1 | Separate types | `fix-idl-v0.32.mjs` | [Summary](./IDL_FIX_SUMMARY.md#anchor-0321-format) |
| 0.30.x, 1.x | Inline types | `fix-idl.mjs` | [Summary](./IDL_FIX_SUMMARY.md#newer-anchor-format-030x-1x) |

---

## 💡 Key Concepts

### IDL (Interface Definition Language)

The IDL describes your Solana program's interface:
- Instructions and their parameters
- Account structures
- Custom types
- Program address

### Discriminator

An 8-byte identifier for account types:
- Generated from SHA256("account:<AccountName>")
- Required in Anchor 0.32.1
- Not needed in newer versions

### Type Formats

Different Anchor versions use different type formats:
- **0.32.1:** `"pubkey"` (lowercase)
- **Newer:** `"publicKey"` (camelCase)

---

## 🤝 Contributing

### Found a New Issue?

1. Document the error in [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md)
2. Add example to [Before/After Examples](./examples/idl-before-after.md)
3. Update fix scripts if needed
4. Test thoroughly
5. Submit PR

### Improving Documentation?

1. Keep it concise and actionable
2. Include real examples
3. Test all commands
4. Update this index
5. Submit PR

---

## 📞 Support

### Self-Service

1. Check [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md)
2. Review [Examples](./examples/idl-before-after.md)
3. Read [Debugging Process](./DEBUGGING_PROCESS.md)

### Community

- GitHub Issues
- Solana Stack Exchange
- Anchor Discord

---

## 🎓 Learning Path

### Beginner

1. [IDL Fix Summary](./IDL_FIX_SUMMARY.md) - Understand the problem
2. [Script Usage Guide](../scripts/README_IDL_FIXER.md) - Use the tools
3. [Examples](./examples/idl-before-after.md) - See real transformations

### Intermediate

1. [Troubleshooting Guide](./IDL_TROUBLESHOOTING_GUIDE.md) - Learn error patterns
2. [Debugging Process](./DEBUGGING_PROCESS.md) - Understand the methodology
3. Fix scripts source code - See implementation

### Advanced

1. Contribute new error patterns
2. Extend scripts for new Anchor versions
3. Create additional tooling
4. Help others in the community

---

## ✅ Success Checklist

- [ ] Read the IDL Fix Summary
- [ ] Understand your Anchor version
- [ ] Run appropriate fix script
- [ ] Test with connection script
- [ ] Test with full program script
- [ ] Review examples for your use case
- [ ] Bookmark troubleshooting guide
- [ ] Share knowledge with team

---

## 📊 Documentation Stats

- **Total Documents:** 8 comprehensive guides
- **Scripts:** 4 automated tools
- **Examples:** Multiple real-world cases
- **Error Patterns:** 4+ documented and solved
- **Anchor Versions:** 2+ supported

---

## 🔄 Updates

**Last Updated:** October 31, 2024

**Recent Changes:**
- ✅ Complete IDL troubleshooting guide
- ✅ Automated fix scripts for multiple Anchor versions
- ✅ Comprehensive debugging case study
- ✅ Real-world examples and test cases
- ✅ Reusable tools for the community

---

## 🌟 Highlights

### What Makes This Special

1. **Complete Solution:** Not just fixes, but understanding
2. **Automated Tools:** Scripts that do the work for you
3. **Real Examples:** Actual transformations from this project
4. **Debugging Journey:** Learn the process, not just the answer
5. **Community Ready:** Designed for reuse by others

### Impact

- **Time Saved:** Hours of debugging → Minutes of fixing
- **Knowledge Shared:** Complete documentation for community
- **Tools Created:** Reusable scripts for similar issues
- **Patterns Documented:** Error catalog for future reference

---

**Ready to get started?** Begin with the [IDL Fix Summary](./IDL_FIX_SUMMARY.md)!
