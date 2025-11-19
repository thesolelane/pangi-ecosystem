# PANGI Ecosystem - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Run Tests
```bash
cd pangi-dapp
npm test                    # Run all 144 CommonJS tests
npm run test:esm            # Run all 36 ESM tests
```

### 2. Verify Devnet Setup
```bash
./scripts/verify-devnet.sh  # Automated devnet verification
```

### 3. Deploy to Devnet
```bash
anchor build
anchor deploy --provider.cluster devnet
```

## 📋 Quick Commands

### Testing
```bash
# All tests
npm test                    # 144 tests (CommonJS)
npm run test:esm            # 36 tests (ESM)

# Individual programs
npm run test:token          # Token program (6 tests)
npm run test:nft            # NFT program (9 tests)
npm run test:vault          # Vault program (10 tests)
npm run test:distribution   # Distribution program (11 tests)

# Specific suites
npm run test:sdk            # SDK tests
npm run test:integration    # Integration tests
npm run test:cross-program  # Cross-program tests
```

### Development
```bash
# Frontend
cd pangi-dapp
npm run dev                 # Start Next.js dev server

# Watch tests
npm run test:watch          # Watch mode for TDD
```

### Devnet
```bash
# Automated setup
./scripts/verify-devnet.sh              # Verify devnet connection
./scripts/setup-token-accounts.sh       # Setup token accounts
./scripts/test-token-transfer.sh 100    # Test transfer with tax

# Manual commands
solana config set --url https://api.devnet.solana.com
solana balance
solana airdrop 2
spl-token account-info 6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be --url devnet
```

### Build & Deploy
```bash
# Build
anchor build

# Deploy
anchor deploy --provider.cluster devnet

# Initialize
anchor run initialize-token --provider.cluster devnet
anchor run initialize-distribution --provider.cluster devnet
```

## 📊 Test Status

| Configuration | Tests | Status |
|--------------|-------|--------|
| CommonJS     | 144   | ✅ Passing |
| ESM          | 36    | ✅ Passing |
| **Total**    | **180** | ✅ **All Passing** |

## 🏗️ Project Structure

```
pangi-ecosystem/
├── programs/                    # Anchor programs
│   ├── pangi-token/            # Token with tax
│   ├── pangi-nft/              # NFT evolution
│   ├── pangi-vault/            # NFT-linked vaults
│   └── special-distribution/   # Token distribution
├── pangi-dapp/                 # Next.js frontend
│   ├── __tests__/              # Test files
│   │   ├── *.test.ts          # CommonJS tests
│   │   └── *.esm.test.ts      # ESM tests
│   ├── lib/                    # SDK & utilities
│   └── components/             # React components
├── scripts/                    # Utility scripts
│   └── verify-devnet.sh       # Devnet verification
├── DEVNET_SETUP.md            # Devnet guide
├── TEST_SUMMARY.md            # Test documentation
└── QUICK_START.md             # This file
```

## 🎯 Key Features

### Token Program
- Dynamic tax rates (1%, 0.5%, 2%, 0%)
- Conservation fund allocation
- Whale transfer detection
- Exchange deposit optimization

### NFT Program
- 10 evolution stages
- 24-hour cooldown
- Increasing rewards
- Pangopup → Transcendent

### Vault Program
- NFT-linked storage
- Secure deposits/withdrawals
- Balance tracking
- Authority validation

### Distribution Program
- 50% burn, 25% vest, 25% liquid
- 63M PANGI total supply
- 100 special NFTs
- 1-year vesting schedule

## 📚 Documentation

- **Test Summary:** `TEST_SUMMARY.md` - Complete test documentation
- **Devnet Setup:** `DEVNET_SETUP.md` - Deployment guide
- **Devnet Testing:** `DEVNET_TESTING.md` - Token transfer testing
- **Quick Start:** `QUICK_START.md` - This file

## 🔧 Troubleshooting

### Tests Failing
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run specific test
npm test -- <test-name>
```

### Devnet Issues
```bash
# Check connection
solana cluster-version --url devnet

# Request airdrop
solana airdrop 2

# Check program
solana program show <PROGRAM_ID> --url devnet
```

### Build Errors
```bash
# Clean build
anchor clean
anchor build

# Check Anchor version
anchor --version

# Update dependencies
cargo update
```

## 🎓 Learning Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [SPL Token Guide](https://spl.solana.com/token)
- [Next.js Documentation](https://nextjs.org/docs)

## ✅ Checklist

Before deploying to mainnet:

- [ ] All 180 tests passing
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation reviewed
- [ ] Devnet testing completed
- [ ] Program IDs updated
- [ ] Frontend tested
- [ ] Wallet integration verified
- [ ] Error handling tested
- [ ] Backup plan ready

## 🚀 Ready to Deploy!

Your PANGI ecosystem is fully tested and ready for devnet deployment!

```bash
# Final verification
npm test && npm run test:esm

# Deploy
anchor deploy --provider.cluster devnet

# Celebrate! 🎉
```

---

**Need Help?**
- Check `TEST_SUMMARY.md` for detailed test information
- See `DEVNET_SETUP.md` for deployment steps
- Review test files in `pangi-dapp/__tests__/`
