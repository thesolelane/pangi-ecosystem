# 🦎 Pangi Pangolin Ecosystem

Solana-based conservation project protecting endangered pangolins through blockchain technology.

## Mission

Protect endangered pangolins through blockchain technology, utility tokens, and community-driven conservation funding.

## 🪙 PANGI Token

### Token Details
- **Symbol:** PANGI
- **Supply:** 10,000,000,000 (10 Billion)
- **Decimals:** 9
- **Network:** Solana (Devnet)
- **Program ID:** `E6gtTbG83UUoW1gZBzmWAGTEAbVa12AqnzfwWQJqtmmf`

### Transaction Fees
- **Buy Tax:** 0.05% → Conservation Fund
- **Sell Tax:** 2.00% → Conservation Fund
- **Transfer:** 0% (Free peer-to-peer)

### Utility
- ✅ Payments for conservation merchandise
- ✅ Platform fees and services
- ✅ Governance voting rights
- ✅ Staking rewards

[📄 Full Tokenomics Documentation](docs/TOKENOMICS.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Solana CLI
- Rust & Cargo
- Phantom Wallet (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/thesolelane/pangi-ecosystem.git
cd pangi-ecosystem

# Install Solana program dependencies
cd programs/pangi-token
cargo build-sbf

# Install frontend dependencies
cd ../../frontend
npm install

# Start development server
npm run dev
```

### Deploy to Devnet

```bash
# Configure Solana CLI
solana config set --url devnet

# Create wallet (if needed)
solana-keygen new

# Get test SOL
solana airdrop 2

# Deploy program
cd programs/pangi-token
solana program deploy target/deploy/pangi_token.so
```

## 📁 Project Structure

```
pangi-ecosystem/
├── programs/
│   └── pangi-token/          # Solana smart contract
│       ├── src/
│       │   └── lib.rs        # Program logic
│       └── Cargo.toml
├── frontend/                  # Next.js dApp
│   ├── src/
│   │   ├── app/              # Pages and layouts
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utilities and config
│   └── package.json
├── scripts/                   # Deployment scripts
│   └── config.ts             # Program configuration
├── docs/                      # Documentation
│   ├── TOKENOMICS.md         # Token economics
│   └── TOKEN_CONFIG.json     # Token configuration
└── readme.md
```

## 🌐 Live Demo

**Frontend:** [View on Gitpod](https://3002--019a3329-60bf-7479-9eff-143710855c56.us-east-1-01.gitpod.dev)  
**Program:** [View on Solana Explorer](https://explorer.solana.com/address/E6gtTbG83UUoW1gZBzmWAGTEAbVa12AqnzfwWQJqtmmf?cluster=devnet)

## 🦎 About Pangolins

Pangolins are the world's most trafficked mammals, with over 1 million pangolins poached in the last decade. This project aims to:

- Raise awareness about pangolin conservation
- Fund rescue and rehabilitation centers
- Support anti-poaching initiatives
- Protect pangolin habitats
- Build a global conservation community

## 🛠️ Technology Stack

- **Blockchain:** Solana
- **Smart Contracts:** Rust
- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Wallet Integration:** Solana Wallet Adapter
- **Web3:** @solana/web3.js

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Smart contract deployment
- [x] Frontend dApp
- [x] Wallet integration
- [x] Token specification

### Phase 2: Launch (Q1 2025)
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] DEX listing
- [ ] Community launch

### Phase 3: Ecosystem (Q2 2025)
- [ ] Staking platform
- [ ] Governance DAO
- [ ] Conservation dashboard
- [ ] Partner integrations

### Phase 4: Impact (Q3-Q4 2025)
- [ ] First conservation projects funded
- [ ] NFT marketplace
- [ ] Mobile app
- [ ] Global partnerships

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation:** [docs/](docs/)
- **Tokenomics:** [TOKENOMICS.md](docs/TOKENOMICS.md)
- **GitHub:** [thesolelane/pangi-ecosystem](https://github.com/thesolelane/pangi-ecosystem)
- **Solana Explorer:** [View Program](https://explorer.solana.com/address/E6gtTbG83UUoW1gZBzmWAGTEAbVa12AqnzfwWQJqtmmf?cluster=devnet)

## 💬 Community

Join our community to stay updated and contribute:

- Twitter: @PangiToken (Coming Soon)
- Discord: discord.gg/pangi (Coming Soon)
- Telegram: t.me/pangitoken (Coming Soon)

---

**🦎 Protecting Endangered Pangolins Through Blockchain Technology**

*Built with ❤️ for pangolin conservation*
