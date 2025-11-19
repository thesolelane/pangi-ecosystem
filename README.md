<div align="center">

# 🦎 PANGI Ecosystem

**A comprehensive Solana token ecosystem with dynamic tax rates, NFT evolution, and advanced DeFi features**

## Measured in Scales ⚖️

**1 PANGI = 1 billion scales** | Just like Bitcoin has satoshis, PANGI has scales!

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-1.16+-purple.svg)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.32.1-coral.svg)](https://www.anchor-lang.com/)
[![Tests](https://img.shields.io/badge/tests-180%20passing-success.svg)](TEST_SUMMARY.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Features](#-features) •
[Contributing](#-contributing) •
[Community](#-community)

</div>

---

## 🎯 Overview

PANGI is a Solana-based token ecosystem built with Anchor, featuring four interconnected on-chain programs that work together to create a unique DeFi experience.

### Core Programs

| Program | Description | Status |
|---------|-------------|--------|
| 🪙 **Token Program** | PANGI token with dynamic tax rates (1%, 0.5%, 2%, 0%) | ✅ Ready |
| 🥚 **NFT Program** | Pangopup NFTs with 10 evolution stages | ✅ Ready |
| 🏦 **Vault Program** | NFT-linked token storage and management | ✅ Ready |
| 🎁 **Distribution Program** | Special token distribution (50% burn, 25% vest, 25% liquid) | ✅ Ready |

### Key Features

- **Dynamic Tax System**: Context-aware tax rates for different transfer types
- **NFT Evolution**: Pangopups evolve through 10 stages based on token holdings
- **Vault Integration**: Secure token storage linked to NFT ownership
- **Conservation Fund**: Automated tax collection for ecosystem sustainability
- **Cross-Program Composability**: Programs work together seamlessly

## ✅ Status

- **Tests:** 180 passing (144 CommonJS + 36 ESM)
- **Programs:** 4 ready for deployment
- **Scripts:** 7 automated tools
- **Documentation:** 6 comprehensive guides

## 🚀 Quick Start

```bash
# Run tests
cd pangi-dapp && npm test

# Deploy to devnet
npm run check:deployment
anchor build
anchor deploy --provider.cluster devnet

# Test real connection
npm run test:real
```

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

## 📚 Documentation

- [QUICK_START.md](QUICK_START.md) - Quick reference
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
- [TEST_SUMMARY.md](TEST_SUMMARY.md) - Test documentation (180 tests)
- [DEVNET_TESTING.md](DEVNET_TESTING.md) - Token transfer testing
- [README_SCRIPTS.md](README_SCRIPTS.md) - Scripts reference

## 🛠️ Scripts

```bash
npm run test:real          # Test real program connection
npm run check:deployment   # Pre-deployment checklist
npm run check:programs     # Verify deployment status
npm run verify:devnet      # Verify devnet setup
npm run setup:accounts     # Setup token accounts
npm run test:transfer      # Test token transfers
```

## 📊 Test Coverage: 180 Tests

| Category | Tests | Status |
|----------|-------|--------|
| Token Program | 41 | ✅ |
| NFT Program | 30 | ✅ |
| Vault Program | 10 | ✅ |
| Distribution Program | 11 | ✅ |
| Cross-Program | 12 | ✅ |
| SDK & Integration | 76 | ✅ |

## 🔧 IDL Tools

We've created comprehensive tools for fixing Anchor IDL format issues:

```bash
# Fix IDL for Anchor 0.32.1
node scripts/fix-idl-v0.32.mjs

# Test connection
node scripts/test-connection.js
```

See [docs/IDL_TROUBLESHOOTING_GUIDE.md](docs/IDL_TROUBLESHOOTING_GUIDE.md) for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs via [GitHub Issues](https://github.com/thesolelane/pangi-ecosystem/issues)
- ✨ Suggest features via [GitHub Discussions](https://github.com/thesolelane/pangi-ecosystem/discussions)
- 📝 Improve documentation
- 🧪 Add tests
- 💻 Submit pull requests

### Development Setup

```bash
# Clone the repository
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem

# Install dependencies
npm install
cd pangi-dapp && npm install

# Run tests
npm test

# Start development
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

Security is a top priority. Please see [SECURITY.md](SECURITY.md) for:
- Reporting vulnerabilities
- Security best practices
- Audit status

**Never commit private keys or sensitive data!**

## 🌟 Community

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community chat
- **Documentation**: Comprehensive guides in [docs/](docs/)

## 📊 Project Stats

- **Programs**: 4 Solana programs
- **Tests**: 180 passing (100% success rate)
- **Documentation**: 15+ comprehensive guides
- **Scripts**: 10+ automation tools
- **Lines of Code**: [TBD]

## 🎯 Roadmap

- [x] Core programs development
- [x] Comprehensive testing suite
- [x] IDL troubleshooting tools
- [x] Documentation
- [ ] Security audit
- [ ] Devnet deployment
- [ ] Testnet deployment
- [ ] Mainnet launch

## 🙏 Acknowledgments

- Built with [Anchor](https://www.anchor-lang.com/)
- Powered by [Solana](https://solana.com/)
- Developed with assistance from [Ona](https://ona.com/)

## 📞 Support

Need help?

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/thesolelane/pangi-ecosystem/issues)
3. Ask in [discussions](https://github.com/thesolelane/pangi-ecosystem/discussions)
4. Read the [troubleshooting guide](docs/IDL_TROUBLESHOOTING_GUIDE.md)

---

<div align="center">

**Built with ❤️ for the Solana ecosystem**

[Documentation](docs/) • [Contributing](CONTRIBUTING.md) • [License](LICENSE) • [Security](SECURITY.md)

</div>
