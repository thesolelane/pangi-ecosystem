# 🦎 PANGI Pangolin Ecosystem

> A complete Solana-based conservation ecosystem with dynamic taxation, evolving NFTs, and asset management vaults.

## 🌟 Overview

PANGI is a multi-program Solana ecosystem designed to fund pangolin conservation through innovative blockchain mechanics. Every transaction contributes to saving pangolins while providing utility and rewards to holders.

## 📦 Programs

### 1. Pangi Token (✅ Complete)
**Fungible SPL token with conservation tax**

- Dynamic tax rates (P2P: 1%, Exchange: 0.5%, Whale: 2%)
- Basis points precision (0.01%)
- Exchange & reward distributor registries
- Space-optimized (146 bytes)
- **Status:** Production-ready

[📖 Documentation](programs/pangi-token/README.md)

### 2. Pangi NFT (🚧 In Progress)
**Metaplex-compatible NFTs with evolution mechanics**

- Evolution system (levels 1-10)
- Rarity tiers (Common → Legendary → Special)
- Dynamic metadata updates
- Staking integration
- 25 special influencer NFTs
- **Status:** Architecture complete

[📖 Documentation](programs/pangi-nft/README.md)

### 3. Pangi Vault (🚧 In Progress)
**NFT-attached wallets for asset management**

- One vault per NFT
- Multi-token storage
- Automatic reward accumulation
- Tax-free withdrawals
- Staking rewards
- **Status:** Architecture complete

[📖 Documentation](programs/pangi-vault/README.md)

### 4. Special Distribution (✅ Complete)
**NFT-based token distribution with anti-dump mechanics**

- 63M PANGI distribution
- Three-layer protection (50% burn, 25% vest, 25% liquid)
- Tier-based allocation (1M, 5M, 10M)
- 1-year vesting
- **Status:** Production-ready

[📖 Documentation](programs/special-distribution/README.md)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  PANGI ECOSYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Ecosystem Coordinator (Hub)                │ │
│  │  • Cross-program orchestration                     │ │
│  │  • State synchronization                           │ │
│  │  • Emergency controls                              │ │
│  └────────┬──────────┬──────────┬─────────────────────┘ │
│           │          │          │                       │
│           ▼          ▼          ▼                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  Token   │ │   NFT    │ │  Vault   │               │
│  │  ──────  │ │  ─────   │ │  ──────  │               │
│  │  • Tax   │ │  • Evolve│ │  • Store │               │
│  │  • Trade │ │  • Stake │ │  • Reward│               │
│  └──────────┘ └──────────┘ └──────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

[📖 Full Architecture](ECOSYSTEM.md)

## 🚀 Quick Start

### Prerequisites
```bash
# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Node.js (v18+)
nvm install 18
nvm use 18
```

### Build
```bash
# Build all programs
./build.sh

# Or build individually
cargo build-sbf --manifest-path programs/pangi-token/Cargo.toml
cargo build-sbf --manifest-path programs/pangi-nft/Cargo.toml
cargo build-sbf --manifest-path programs/pangi-vault/Cargo.toml
cargo build-sbf --manifest-path programs/special-distribution/Cargo.toml
```

### Test
```bash
# Run all tests
anchor test

# Run unit tests
npm run test:unit
```

### Deploy
```bash
# Deploy to devnet
solana config set --url devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
```

## 📊 Key Features

### Dynamic Tax System
- **P2P Transfers:** 1% tax
- **Exchange Deposits:** 0.5% tax
- **Whale Transfers:** 2% tax (>10M tokens)
- **Rewards:** 0% tax

### NFT Evolution
- **10 Levels:** Hatchling → Transcendent
- **Evolution Points:** Earned through staking, holding, trading
- **Rewards:** Up to 94,350 PANGI for max evolution
- **Rarity Bonuses:** Up to +100% for special NFTs

### Vault System
- **Automatic Accumulation:** Staking + evolution rewards
- **Tax-Free Withdrawals:** All vault withdrawals exempt
- **Multi-Token Support:** PANGI + other SPL tokens
- **NFT-Linked:** Vault transfers with NFT

## 💰 Tokenomics

### Total Supply
- **1,000,000,000 PANGI** (1 Billion)

### Distribution
- **Special NFTs:** 63M (6.3%)
  - 50% burned (31.5M)
  - 25% vested (15.75M)
  - 25% liquid (15.75M)
- **Liquidity:** TBD
- **Treasury:** TBD
- **Community:** TBD

### Tax Revenue (Estimated)
- **Daily:** ~9.5M PANGI (1B volume)
- **Annual:** ~3.47B PANGI
- **Destination:** Conservation fund

## 🎯 Use Cases

### For Users
1. **Buy & Hold:** Earn through appreciation
2. **Mint NFT:** Get evolving digital asset
3. **Stake NFT:** Earn passive rewards
4. **Evolve NFT:** Unlock bonuses
5. **Trade:** Participate in ecosystem

### For Influencers
1. **Receive Special NFT:** 1M-10M PANGI allocation
2. **Tax Exemption:** 0% tax on transfers
3. **2x Rewards:** Double staking & evolution
4. **Exclusive Benefits:** Special perks
5. **Conservation Impact:** Direct contribution

### For Developers
1. **CPI Integration:** Call programs from your code
2. **Composability:** Build on top of ecosystem
3. **SDK Access:** TypeScript/Rust SDKs
4. **Event Listening:** React to ecosystem events
5. **Open Source:** Contribute to codebase

## 📈 Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Pangi Token with dynamic tax
- [x] Special Distribution program
- [x] Build & test infrastructure
- [x] Documentation

### Phase 2: NFT & Vaults (🚧 In Progress)
- [ ] Pangi NFT with evolution
- [ ] Pangi Vault with rewards
- [ ] Cross-program integration
- [ ] Integration tests

### Phase 3: Launch (🔜 Coming Soon)
- [ ] Security audit
- [ ] Devnet testing
- [ ] Mainnet deployment
- [ ] Special NFT distribution

### Phase 4: Expansion (🔮 Future)
- [ ] Governance system
- [ ] DAO treasury
- [ ] NFT marketplace
- [ ] Cross-chain bridges

## 🔐 Security

### Audits
- **Status:** Pending
- **Scope:** All programs
- **Timeline:** Before mainnet

### Best Practices
- ✅ Checked arithmetic
- ✅ Account validation
- ✅ PDA security
- ✅ Authority checks
- ✅ Rate limiting

### Bug Bounty
- **Program:** Coming soon
- **Rewards:** TBD
- **Scope:** All programs

## 📚 Documentation

### Program Documentation
- [Pangi Token](programs/pangi-token/README.md)
- [Pangi NFT](programs/pangi-nft/README.md)
- [Pangi Vault](programs/pangi-vault/README.md)
- [Special Distribution](programs/special-distribution/README.md)

### Technical Documentation
- [Architecture](ECOSYSTEM.md)
- [Build Guide](BUILD.md)
- [Dynamic Tax System](programs/pangi-token/DYNAMIC_TAX.md)
- [Registry System](programs/pangi-token/REGISTRY_SYSTEM.md)
- [Optimizations](programs/pangi-token/OPTIMIZATIONS.md)

### API Documentation
- [TypeScript SDK](#) (Coming soon)
- [Rust SDK](#) (Coming soon)
- [REST API](#) (Coming soon)

## 🤝 Contributing

We welcome contributions!

### How to Contribute
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Setup
```bash
# Clone repository
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem

# Install dependencies
npm install

# Build programs
./build.sh

# Run tests
anchor test
```

### Code Style
- Follow Rust conventions
- Use `cargo fmt` for formatting
- Run `cargo clippy` for linting
- Add tests for new features
- Update documentation

## 🌍 Conservation Impact

### Mission
Save pangolins through blockchain innovation

### How It Works
1. **Every Transfer:** 0.5-2% tax collected
2. **Conservation Fund:** Taxes accumulate
3. **Direct Impact:** Fund conservation projects
4. **Transparency:** All on-chain and verifiable

### Partners
- Wildlife conservation organizations
- Pangolin rescue centers
- Research institutions
- Community initiatives

### Impact Metrics
- **Tokens Collected:** Real-time tracking
- **Projects Funded:** Transparent reporting
- **Pangolins Saved:** Measurable outcomes
- **Community Engagement:** Active participation

## 📞 Contact

### Community
- **Discord:** [Join our server](#)
- **Twitter:** [@PangiToken](#)
- **Telegram:** [PANGI Community](#)
- **Reddit:** [r/PangiToken](#)

### Development
- **GitHub:** [pangi-ecosystem](https://github.com/thesolelane/pangi-ecosystem)
- **Issues:** [Report bugs](https://github.com/thesolelane/pangi-ecosystem/issues)
- **Discussions:** [Join discussions](https://github.com/thesolelane/pangi-ecosystem/discussions)

### Business
- **Email:** [team@pangi.io](#)
- **Partnerships:** [partnerships@pangi.io](#)
- **Press:** [press@pangi.io](#)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain platform
- **Anchor Framework** - For making Solana development easier
- **Metaplex** - For NFT standards
- **Community** - For support and feedback
- **Pangolins** - For being awesome 🦎

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Not financial advice. Always DYOR (Do Your Own Research).

---

**Built with ❤️ for pangolin conservation**

Every transaction makes a difference! 🦎

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/thesolelane/pangi-ecosystem?style=social)
![GitHub forks](https://img.shields.io/github/forks/thesolelane/pangi-ecosystem?style=social)
![GitHub issues](https://img.shields.io/github/issues/thesolelane/pangi-ecosystem)
![GitHub license](https://img.shields.io/github/license/thesolelane/pangi-ecosystem)

**Status:** 🚧 **Active Development**

**Version:** 0.1.0

**Last Updated:** 2024

---

## 🎯 Quick Links

- [🏗️ Architecture](ECOSYSTEM.md)
- [📖 Build Guide](BUILD.md)
- [🔧 API Docs](#)
- [💬 Discord](#)
- [🐦 Twitter](#)
- [📧 Email](#)

---

**Let's save pangolins together!** 🦎💚
