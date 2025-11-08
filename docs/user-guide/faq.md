# Frequently Asked Questions (FAQ)

Common questions about PANGI ecosystem.

## General Questions

### What is PANGI?

PANGI is an evolving NFT ecosystem on Solana featuring:
- Dynamic NFTs that evolve through 5 tiers
- Staking vaults for earning rewards
- Token distribution system
- Conservation fund supporting real pangolins
- Community governance

### Is PANGI live on mainnet?

Not yet. PANGI is currently on **Solana Devnet** for testing. Mainnet launch will be announced after:
- Security audits complete
- Community testing finished
- All features implemented
- Regulatory compliance verified

### How do I get started?

1. [Set up a Solana wallet](./wallet-setup.md)
2. Switch to Devnet
3. Get free devnet SOL
4. Connect to PANGI dApp
5. Start minting and staking!

### Is PANGI safe?

Security measures:
- ✅ Built with Anchor framework
- ✅ Comprehensive test coverage
- ✅ Open source code
- 🚧 Security audit pending
- 🚧 Bug bounty program planned

**Note:** Currently on devnet - no real value at risk.

---

## Wallet & Setup

### Which wallets are supported?

- **Phantom** (Recommended) - [Download](https://phantom.app/)
- **Solflare** - [Download](https://solflare.com/)
- **Backpack** - [Download](https://backpack.app/)
- **Glow** - [Download](https://glow.app/)

### How do I get devnet SOL?

```bash
# Method 1: Solana Faucet
Visit: https://faucet.solana.com/
Enter your wallet address
Click "Confirm Airdrop"

# Method 2: CLI
solana airdrop 2 --url devnet

# Method 3: QuickNode
Visit: https://faucet.quicknode.com/solana/devnet
```

### Why can't I connect my wallet?

**Common issues:**
1. Wrong network (use Devnet)
2. Wallet not installed
3. Browser not supported
4. Popup blocked

**Solutions:**
- Switch wallet to Devnet
- Install Phantom/Solflare
- Use Chrome/Firefox/Brave
- Allow popups for dApp

### I lost my recovery phrase. What do I do?

**Unfortunately:** If you lose your recovery phrase, your wallet is **permanently inaccessible**.

**Prevention:**
- Write it down on paper
- Store in a safe place
- Never store digitally
- Consider metal backup
- Never share with anyone

---

## NFTs

### How do I mint a PANGI NFT?

1. Connect wallet
2. Navigate to "Mint" section
3. Click "Mint NFT"
4. Approve transaction
5. NFT appears in your wallet

**Cost:** ~0.01 SOL + mint fee

### What are the NFT tiers?

| Tier | Name | Evolution Points |
|------|------|------------------|
| 1 | Egg | 0 (starting) |
| 2 | Baby | 100 |
| 3 | Juvenile | 500 |
| 4 | Adult | 2,000 |
| 5 | Legendary | 10,000 |

### How do I evolve my NFT?

1. Stake NFT in a vault
2. Accumulate evolution points
3. Claim points when ready
4. Go to "Evolve" section
5. Select NFT and evolve

**Time to Legendary:** ~2.8 hours in Standard Vault

### Can I sell my NFT?

Yes! PANGI NFTs are standard Solana NFTs:
- List on Magic Eden
- Sell on Tensor
- Trade peer-to-peer
- Transfer to other wallets

### What are the Special 25 NFTs?

25 unique NFTs with special properties:
- 2.52M PANGI tokens each (63M total)
- Exclusive artwork
- Enhanced staking rewards
- Governance privileges
- Distributed through events

---

## Staking

### How does staking work?

1. Stake your NFT in a vault
2. Earn PANGI tokens per second
3. Accumulate evolution points
4. Claim rewards anytime
5. Unstake anytime (no lock)

### What are the vault types?

| Vault | Reward Rate | Evolution Rate | APY |
|-------|-------------|----------------|-----|
| Standard | 0.001/sec | 1 pt/sec | ~31.5% |
| Premium | 0.002/sec | 2 pt/sec | ~63% |
| Legendary | 0.005/sec | 5 pt/sec | ~157.5% |

### Is there a lock period?

**No!** PANGI has:
- ❌ No lock period
- ❌ No unstaking penalty
- ❌ No cooldown
- ✅ Instant unstaking

### How often should I claim rewards?

Depends on your strategy:
- **Daily:** Need liquidity
- **Weekly:** Balanced approach
- **Monthly:** Minimize gas
- **On evolution:** When upgrading

### Can I lose my NFT by staking?

**No!** Your NFT is:
- Held in secure PDA
- Only you can unstake
- Protected by Solana
- Recoverable always

### What happens if I unstake before claiming?

**You lose unclaimed rewards!**

Always:
1. Claim rewards first
2. Then unstake
3. Check claimable amount

---

## Tokens

### What is the PANGI token?

PANGI is the ecosystem token:
- **Symbol:** PANGI
- **Decimals:** 9
- **Total Supply:** 1 billion
- **Network:** Solana
- **Type:** SPL Token

### How do I get PANGI tokens?

**Devnet (Testing):**
- Stake NFTs
- Community airdrops
- Test faucets

**Mainnet (Future):**
- DEX trading
- Staking rewards
- Liquidity provision
- Special NFT claims

### What is the token distribution?

| Allocation | Amount | Purpose |
|------------|--------|---------|
| Special 25 | 63M (6.3%) | NFT distribution |
| Staking Rewards | 300M (30%) | Vault rewards |
| Liquidity | 200M (20%) | DEX liquidity |
| Treasury | 200M (20%) | Protocol operations |
| Conservation | 100M (10%) | Wildlife support |
| Team | 100M (10%) | Team allocation |
| Community | 37M (3.7%) | Airdrops/events |

### What are the token taxes?

Transfer tax: **2-5%** (configurable)

**Distribution:**
- 50% → Conservation Fund
- 30% → Liquidity Pool
- 20% → Treasury

**Example:** Transfer 1,000 PANGI with 2% tax
- Recipient gets: 980 PANGI
- Conservation: 10 PANGI
- Liquidity: 6 PANGI
- Treasury: 4 PANGI

### Can I trade PANGI tokens?

**Devnet:** No trading (test tokens)

**Mainnet (Future):**
- Raydium DEX
- Orca DEX
- Jupiter aggregator
- CEX listings (planned)

---

## Governance

### How do I vote?

1. Stake PANGI tokens
2. Navigate to Governance
3. Review active proposals
4. Cast your vote
5. Monitor results

**Voting power** = Staked tokens + bonuses

### Can I create proposals?

Yes, if you have:
- ✅ 1,000+ PANGI staked
- ✅ 10 PANGI for proposal fee
- ✅ Clear proposal idea

### What can I vote on?

- Parameter changes
- Treasury allocation
- New features
- Emergency actions
- Governance updates

### How long do votes last?

- **Minimum:** 3 days
- **Maximum:** 7 days
- **Typical:** 5 days

### What is quorum?

Minimum participation required:
- **Quorum:** 25% of voting power
- **Approval:** 50% of votes cast
- **Both required** for proposal to pass

---

## Conservation Fund

### What is the Conservation Fund?

A portion of token taxes goes to:
- Pangolin habitat restoration
- Anti-poaching efforts
- Wildlife research
- Conservation education
- Partner organizations

### How much goes to conservation?

**50% of all transfer taxes**

Example with 1M PANGI transferred daily:
- Tax (2%): 20,000 PANGI
- Conservation: 10,000 PANGI/day
- Annual: 3.65M PANGI

### Which organizations benefit?

Planned partnerships:
- Wildlife Conservation Society
- Pangolin Conservation
- WWF
- Local conservation groups

### Can I track the fund?

Yes! All transactions are on-chain:
- View fund balance
- See all transfers
- Track distributions
- Read quarterly reports

### How are funds distributed?

Through governance:
1. Conservation proposal created
2. Community votes
3. If passed, funds released
4. Organization reports results

---

## Technical Questions

### What blockchain is PANGI on?

**Solana** - Fast, low-cost, eco-friendly

Benefits:
- ~400ms block time
- ~$0.00025 per transaction
- 50,000+ TPS capacity
- Energy efficient

### What is a Program Derived Address (PDA)?

A PDA is a special account:
- Controlled by program
- No private key
- Deterministic address
- Used for vaults/escrows

### How are rewards calculated?

```javascript
rewards = timeStaked * rewardRate
points = timeStaked * evolutionRate
```

Real-time calculation every second.

### What is an IDL?

Interface Definition Language:
- Describes program structure
- Used by frontend
- Contains instructions
- Defines account types

### Can programs be upgraded?

Currently: **Yes** (devnet testing)

Mainnet: **Limited** (security)
- Critical fixes only
- Governance approval
- Time delays
- Multisig control

---

## Troubleshooting

### Transaction failed - what do I do?

**Common causes:**
1. Insufficient SOL
2. Network congestion
3. Wrong network
4. Slippage too low

**Solutions:**
1. Get more SOL
2. Wait and retry
3. Switch to Devnet
4. Increase slippage

### My balance isn't updating

**Solutions:**
- Refresh page
- Wait 10 seconds
- Check Solana Explorer
- Reconnect wallet
- Clear cache

### I can't see my NFT

**Causes:**
- Wrong network
- NFT is staked
- Wallet not synced
- Wrong wallet connected

**Solutions:**
- Switch to Devnet
- Check "My Stakes"
- Refresh wallet
- Verify wallet address

### Gas fees are too high

**On Solana:**
- Fees are ~$0.00025
- Much cheaper than Ethereum
- Devnet fees are free

**If fees seem high:**
- Check you're on Solana
- Verify network (Devnet)
- Not Ethereum!

---

## Security

### Is my wallet safe?

Your wallet is safe if:
- ✅ You keep seed phrase secure
- ✅ You verify transactions
- ✅ You use official dApp
- ✅ You avoid phishing

### How do I avoid scams?

**Red flags:**
- Unsolicited DMs
- "Support" asking for seed phrase
- Fake websites
- Too-good-to-be-true offers

**Stay safe:**
- Bookmark official dApp
- Never share seed phrase
- Verify URLs
- Use hardware wallet

### What if I get hacked?

**If compromised:**
1. Create new wallet immediately
2. Transfer assets to new wallet
3. Never use old wallet again
4. Report to team

**Prevention:**
- Use hardware wallet
- Enable 2FA where possible
- Keep software updated
- Be cautious of links

### Can the team steal my funds?

**No!** Because:
- Smart contracts are immutable
- Your keys = your control
- Transparent on-chain
- Open source code

---

## Roadmap & Future

### When is mainnet launch?

**Timeline:**
- Q1 2025: Security audits
- Q2 2025: Mainnet deployment
- Q3 2025: Full feature rollout

**Prerequisites:**
- Audits complete
- Testing finished
- Community ready
- Regulatory clear

### What features are coming?

**Phase 1 (Current):**
- ✅ NFT minting
- ✅ Staking vaults
- ✅ Basic governance
- 🚧 Mobile app

**Phase 2 (Q2 2025):**
- Token trading
- Advanced governance
- More vault types
- Partnership integrations

**Phase 3 (Q3 2025):**
- Cross-chain bridge
- NFT marketplace
- Governance v2
- Conservation dashboard

### Will there be a mobile app?

Yes! Planned for Q2 2025:
- iOS and Android
- Full wallet integration
- Staking interface
- NFT gallery
- Governance voting

### Can I contribute?

Absolutely! Ways to help:
- Test on devnet
- Report bugs
- Suggest features
- Create content
- Translate docs
- Join Discord

---

## Getting Help

### Where can I get support?

**Community:**
- Discord: [Join here](#)
- Twitter: [@PANGIProtocol](#)
- Forum: [forum.pangi.io](#)

**Documentation:**
- [Getting Started](./getting-started.md)
- [Wallet Setup](./wallet-setup.md)
- [Staking Guide](./staking-guide.md)
- [Governance Guide](./governance-guide.md)

**Technical:**
- GitHub Issues
- Developer Discord
- Email: dev@pangi.io

### How do I report a bug?

1. Check if already reported
2. Gather details:
   - What happened
   - Expected behavior
   - Steps to reproduce
   - Screenshots
   - Transaction signature
3. Report on GitHub Issues
4. Or Discord #bug-reports

### Can I suggest features?

Yes! We love feedback:
1. Join Discord
2. Post in #feature-requests
3. Explain your idea
4. Discuss with community
5. May become a governance proposal

---

## Disclaimer

### Is this financial advice?

**No!** This documentation is:
- Educational only
- Not financial advice
- Not investment recommendation
- For informational purposes

**Always:**
- Do your own research
- Understand the risks
- Never invest more than you can lose
- Consult financial advisor

### What are the risks?

**Smart contract risks:**
- Bugs in code
- Exploits
- Upgrades

**Market risks:**
- Price volatility
- Liquidity issues
- Regulatory changes

**Mitigation:**
- Security audits
- Bug bounties
- Insurance (planned)
- Gradual rollout

### Is PANGI audited?

**Current status:** Not yet

**Planned:**
- Q1 2025: Security audit
- Multiple audit firms
- Public report
- Bug bounty program

**Until then:**
- Use at own risk
- Devnet only
- No real value

---

**Still have questions?** Join our [Discord](#) or check the [full documentation](../README.md)!
