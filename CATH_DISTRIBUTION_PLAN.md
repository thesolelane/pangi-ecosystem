# $CATH Token Distribution Plan

## Token Information

**Contract Address**: `48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA`  
**Total Supply**: [To be determined - check on-chain]  
**Decimals**: 9 (standard SPL token)  
**Blockchain**: Solana  

---

## Current Status Assessment

### Step 1: Verify Token Supply

```bash
# Check total supply
spl-token supply 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA

# Check mint authority
spl-token display 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA

# Check current holders
# Use Solscan API or Solana Explorer
```

**Questions to Answer**:
1. What is the total supply?
2. Is mint authority enabled or disabled?
3. Who currently holds the tokens?
4. Is there existing liquidity?
5. What's the current price (if any)?

---

## Distribution Strategy

### Scenario A: Fixed Supply (Mint Authority Disabled)

**If total supply is fixed (e.g., 100M, 1B, 10B)**:

#### Recommended Distribution

```
Total Supply: [ACTUAL_SUPPLY] CATH

Staking Rewards Pool:     50% 
├─ NFT Staking:           30%
├─ PANGI Staking:         15%
└─ Liquidity Mining:      5%

Ecosystem Fund:           20%
├─ Guardian Rewards:      10%
├─ Community Incentives:  5%
└─ Partnerships:          5%

Initial Liquidity:        15%
├─ CATH/SOL Pool:         10%
└─ CATH/PANGI Pool:       5%

Team & Development:       10%
└─ Vested over 12 months

Reserve:                  5%
└─ Emergency & strategic
```

---

### Scenario B: Unlimited Supply (Mint Authority Enabled)

**If mint authority is still active**:

#### Phase 1: Initial Distribution (100M CATH)

```
Mint: 100,000,000 CATH

Staking Rewards Pool:     50,000,000 CATH (50%)
Initial Liquidity:        15,000,000 CATH (15%)
Ecosystem Fund:           20,000,000 CATH (20%)
Team & Development:       10,000,000 CATH (10%)
Reserve:                   5,000,000 CATH (5%)
```

#### Phase 2: Ongoing Emission

```
Year 1: +10,000,000 CATH (10% inflation)
Year 2: +9,000,000 CATH (8.2% inflation)
Year 3: +8,000,000 CATH (6.7% inflation)
Year 4+: +5,000,000 CATH/year (decreasing %)
```

**Then disable mint authority** after initial distribution

---

## Wallet Setup

### Required Wallets

#### 1. Burn Address
```
Purpose: Permanent burn (50% of unlock fees)
Type: Token account with no authority
Setup: Create token account, remove authority

Command:
spl-token create-account 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA
spl-token authorize [TOKEN_ACCOUNT] owner --disable

Address: [To be created]
```

#### 2. Staking Rewards Pool
```
Purpose: Holds CATH for staking rewards
Initial Balance: 50% of supply
Authority: Program PDA (smart contract controlled)

Setup:
1. Create token account
2. Transfer 50% of supply
3. Transfer authority to program PDA

Address: [To be created]
```

#### 3. Treasury
```
Purpose: Development fund, buybacks, operations
Initial Balance: 20% of supply
Authority: Multi-sig (3-of-5)

Setup:
1. Create multi-sig wallet (Squads Protocol)
2. Create token account owned by multi-sig
3. Transfer 20% of supply

Signers:
- Founder 1
- Founder 2
- Developer 1
- Community Rep 1
- Community Rep 2

Address: [To be created]
```

#### 4. Team Vesting
```
Purpose: Team allocation with vesting
Initial Balance: 10% of supply
Authority: Vesting contract

Setup:
1. Deploy vesting contract
2. Create token account owned by vesting contract
3. Transfer 10% of supply
4. Configure vesting schedule

Vesting:
- Cliff: 3 months
- Duration: 12 months
- Linear release

Address: [To be created]
```

#### 5. Ecosystem Fund
```
Purpose: Community incentives, partnerships
Initial Balance: 20% of supply
Authority: DAO governance (future) or multi-sig

Setup:
1. Create token account
2. Transfer 20% of supply
3. Set up governance rules

Address: [To be created]
```

---

## Liquidity Setup

### CATH/SOL Pool (Raydium)

**Initial Liquidity**: 10% of supply

**Example** (assuming 100M supply):
```
CATH: 10,000,000 CATH
SOL: 100 SOL (~$10,000)
Initial Price: $0.001 per CATH
Market Cap: $100,000
```

**Steps**:
1. Go to Raydium.io
2. Connect wallet with CATH tokens
3. Create new pool: CATH/SOL
4. Add liquidity: 10M CATH + 100 SOL
5. Lock LP tokens for 6-12 months

**LP Token Locking**:
- Use Streamflow or similar
- Lock for 6-12 months
- Prevents rug pull concerns

---

### CATH/PANGI Pool (Raydium)

**Initial Liquidity**: 5% of supply

**Example** (assuming 100M supply):
```
CATH: 5,000,000 CATH
PANGI: 5,000,000 PANGI
Initial Ratio: 1 CATH = 1 PANGI
```

**Steps**:
1. Ensure PANGI liquidity exists first
2. Create CATH/PANGI pool on Raydium
3. Add liquidity: 5M CATH + 5M PANGI
4. Lock LP tokens for 6-12 months

---

## Distribution Timeline

### Week 1: Setup & Verification

**Day 1-2: Token Analysis**
- [ ] Check total supply on-chain
- [ ] Verify mint authority status
- [ ] Identify current holders
- [ ] Check existing liquidity
- [ ] Determine distribution strategy

**Day 3-4: Wallet Creation**
- [ ] Create burn address
- [ ] Create staking rewards pool
- [ ] Set up treasury multi-sig
- [ ] Create team vesting contract
- [ ] Create ecosystem fund wallet

**Day 5-7: Initial Distribution**
- [ ] Transfer to staking rewards pool (50%)
- [ ] Transfer to treasury (20%)
- [ ] Transfer to team vesting (10%)
- [ ] Transfer to ecosystem fund (20%)
- [ ] Verify all transfers

---

### Week 2: Liquidity & Launch

**Day 8-9: Liquidity Pools**
- [ ] Create CATH/SOL pool on Raydium
- [ ] Add initial liquidity (10% of supply)
- [ ] Lock LP tokens
- [ ] Verify pool creation

**Day 10-11: Secondary Pool**
- [ ] Create CATH/PANGI pool
- [ ] Add liquidity (5% of supply)
- [ ] Lock LP tokens

**Day 12-14: Launch**
- [ ] Announce token utility
- [ ] Enable NFT unlock function
- [ ] Enable staking rewards
- [ ] Monitor initial activity

---

### Week 3-4: Ecosystem Activation

**Week 3: Staking Launch**
- [ ] Enable NFT staking for CATH
- [ ] Enable PANGI staking for CATH
- [ ] First reward distributions
- [ ] Monitor staking participation

**Week 4: Utility Activation**
- [ ] Enable NFT unlock with CATH
- [ ] First unlock transactions
- [ ] Monitor burn rate
- [ ] Adjust parameters if needed

---

## Smart Contract Deployment

### Required Contracts

#### 1. NFT Unlock Contract
```rust
// Handles NFT unlock with CATH payment
// Distributes: 50% burn, 30% rewards, 20% treasury

Functions:
- unlock_adult_nft(pangopup_id)
- verify_payment(amount)
- distribute_cath(burn, rewards, treasury)
- airdrop_adult_nft(user, adult_id)
```

#### 2. NFT Staking Contract
```rust
// Handles NFT staking for CATH rewards
// Rates: 10 CATH/day (pangopup), 15 CATH/day (adult)

Functions:
- stake_nft(nft_mint, nft_type)
- unstake_nft(nft_mint)
- claim_rewards()
- calculate_rewards(time_staked, nft_type)
```

#### 3. PANGI Staking Contract
```rust
// Handles PANGI staking for CATH rewards
// Tiers: 30%, 50%, 75%, 100% APY

Functions:
- stake_pangi(amount, tier)
- unstake_pangi()
- claim_cath_rewards()
- calculate_cath_rewards(pangi_amount, tier, days)
```

#### 4. Vesting Contract
```rust
// Handles team token vesting
// 3-month cliff, 12-month linear

Functions:
- create_vesting_schedule(beneficiary, amount)
- claim_vested_tokens()
- get_vested_amount(current_time)
```

---

## Airdrop Strategy

### Phase 1: Early Supporters (Week 1)

**Recipients**: Test NFT holders, early community members

**Amount**: 1,000,000 CATH (1% of supply)

**Distribution**:
```
Test NFT Holders: 500,000 CATH
├─ 100 holders × 5,000 CATH each

Early Discord Members: 300,000 CATH
├─ Top 100 active members × 3,000 CATH

Twitter Followers: 200,000 CATH
├─ First 1,000 followers × 200 CATH
```

---

### Phase 2: NFT Holders (Week 2-3)

**Recipients**: Pangopup NFT holders

**Amount**: 5,000,000 CATH (5% of supply)

**Distribution**:
```
Per Pangopup: 3,333 CATH
1,500 Pangopups × 3,333 CATH = 5,000,000 CATH

Snapshot: At mint completion or 50% milestone
Claim: Users claim from airdrop contract
```

---

### Phase 3: PANGI Stakers (Week 4)

**Recipients**: PANGI token stakers

**Amount**: 2,000,000 CATH (2% of supply)

**Distribution**:
```
Proportional to PANGI staked:
- Stake 1,000 PANGI: 200 CATH
- Stake 10,000 PANGI: 2,000 CATH
- Stake 100,000 PANGI: 20,000 CATH

Snapshot: Week 3
Claim: Week 4
```

---

## Burn Mechanics

### Automatic Burns

**Source**: NFT unlock fees (50% of 10,000 CATH)

**Process**:
```
User pays: 10,000 CATH
↓
Smart contract splits:
├─ 5,000 CATH → Burn address (50%)
├─ 3,000 CATH → Staking rewards (30%)
└─ 2,000 CATH → Treasury (20%)
```

**Burn Address**:
- Token account with no authority
- Tokens sent here are permanently locked
- Visible on-chain for transparency

---

### Manual Burns (Quarterly)

**Source**: Treasury reserves

**Amount**: 1-5% of treasury balance

**Process**:
```
Q1: Burn 100,000 CATH from treasury
Q2: Burn 150,000 CATH from treasury
Q3: Burn 200,000 CATH from treasury
Q4: Burn 250,000 CATH from treasury

Annual: 700,000 CATH burned from treasury
```

**Announcement**:
- Twitter announcement
- Discord announcement
- Transaction link
- Updated burn stats

---

## Monitoring & Metrics

### Key Metrics to Track

#### Supply Metrics
```
Total Supply: [INITIAL_SUPPLY]
Circulating Supply: [SUPPLY - LOCKED]
Burned Supply: [TOTAL_BURNED]
Locked in Staking: [STAKED_AMOUNT]
Locked in LP: [LP_AMOUNT]
```

#### Price Metrics
```
Current Price: $X.XX
24h Volume: $X,XXX
Market Cap: $XXX,XXX
Liquidity Depth: $XX,XXX
```

#### Usage Metrics
```
Total Unlocks: XXX
Total Burned (unlocks): X,XXX,XXX CATH
Staking Participation: XX%
Daily Active Users: XXX
```

---

### Tracking Tools

**On-Chain Data**:
- Solscan: Token holder distribution
- Solana Explorer: Transaction history
- Dexscreener: Price & volume charts

**Custom Dashboard**:
```typescript
// Track key metrics
async function getCathMetrics() {
  return {
    totalSupply: await getTotalSupply(),
    circulatingSupply: await getCirculatingSupply(),
    totalBurned: await getTotalBurned(),
    price: await getPrice(),
    marketCap: await getMarketCap(),
    holders: await getHolderCount(),
    unlockCount: await getUnlockCount(),
  };
}
```

---

## Security Measures

### Multi-Sig Treasury

**Setup**: Squads Protocol (Solana multi-sig)

**Signers**: 3-of-5 required

**Signers**:
1. Founder 1 (primary)
2. Founder 2 (primary)
3. Lead Developer
4. Community Representative 1
5. Community Representative 2

**Actions Requiring Approval**:
- Treasury transfers >10,000 CATH
- Parameter changes
- Emergency actions
- Partnership allocations

---

### Vesting Contract Security

**Features**:
- Time-locked releases
- Cliff period (3 months)
- Linear vesting (12 months)
- No early unlock
- Transparent on-chain

**Audit**:
- Use audited vesting contract (Streamflow, Bonfida)
- Or audit custom contract
- Verify on-chain before funding

---

### Burn Address Security

**Verification**:
```bash
# Verify no authority
spl-token display [BURN_ADDRESS]

# Should show:
# Authority: None
# Freeze Authority: None
```

**Alternative**: Use actual burn instruction
```rust
// Instead of transfer to burn address
token::burn(ctx, amount)?;
```

---

## Community Communication

### Announcement Template

```markdown
🎉 $CATH Token Distribution Begins!

📍 Contract: 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA

📊 Distribution:
• 50% Staking Rewards
• 20% Ecosystem Fund
• 15% Liquidity
• 10% Team (vested)
• 5% Reserve

🔥 Utility:
• Unlock adult NFTs (10,000 CATH)
• Stake NFTs, earn CATH
• Stake PANGI, earn CATH
• 50% of fees burned

💧 Liquidity:
• CATH/SOL on Raydium
• CATH/PANGI on Raydium
• LP tokens locked 12 months

🎁 Airdrops:
• NFT holders: 3,333 CATH each
• PANGI stakers: Proportional
• Early supporters: Bonus

📈 Launch: [DATE]

More info: [LINK TO DOCS]
```

---

### Transparency Reports

**Monthly Report**:
```markdown
# $CATH Monthly Report - [MONTH]

## Supply Metrics
- Total Supply: XXX,XXX,XXX CATH
- Circulating: XX,XXX,XXX CATH
- Burned: X,XXX,XXX CATH
- Staked: XX,XXX,XXX CATH

## Usage Metrics
- Unlocks: XXX
- Stakers: XXX
- Daily Active: XXX

## Price & Market
- Price: $X.XX
- Market Cap: $XXX,XXX
- Volume: $XX,XXX

## Treasury
- Balance: XX,XXX,XXX CATH
- Spent: XXX,XXX CATH
- Purpose: [DETAILS]

## Next Month
- [PLANS]
```

---

## Risk Management

### Risk 1: Insufficient Liquidity

**Mitigation**:
- Start with 15% of supply in liquidity
- Lock LP tokens for 12 months
- Add more liquidity from treasury if needed
- Incentivize LP providers

---

### Risk 2: Rapid Depletion of Rewards Pool

**Mitigation**:
- Monitor daily emission rate
- Adjust staking rewards if needed
- Cap maximum stakers
- Implement cooldown periods

---

### Risk 3: Price Volatility

**Mitigation**:
- Deep liquidity pools
- Multiple trading pairs
- Dynamic pricing for utility
- Treasury buybacks if needed

---

### Risk 4: Smart Contract Exploits

**Mitigation**:
- Audit all contracts before launch
- Start with small amounts
- Bug bounty program
- Emergency pause function

---

## Launch Checklist

### Pre-Launch (Week 1)
- [ ] Verify token supply and authority
- [ ] Create all required wallets
- [ ] Set up multi-sig treasury
- [ ] Deploy vesting contracts
- [ ] Distribute tokens to wallets
- [ ] Verify all distributions

### Launch Week (Week 2)
- [ ] Create liquidity pools
- [ ] Lock LP tokens
- [ ] Deploy smart contracts
- [ ] Test all functions on devnet
- [ ] Audit smart contracts
- [ ] Deploy to mainnet
- [ ] Announce launch

### Post-Launch (Week 3-4)
- [ ] Enable NFT unlock
- [ ] Enable staking rewards
- [ ] Process airdrops
- [ ] Monitor metrics
- [ ] Adjust parameters
- [ ] Community updates

---

## Budget

### Setup Costs

**Wallet Creation**: $50
- Burn address: $10
- Staking pool: $10
- Treasury: $10
- Vesting: $10
- Ecosystem: $10

**Liquidity**: $10,000-15,000
- CATH/SOL: $10,000 (100 SOL)
- CATH/PANGI: $5,000 (50K PANGI)

**Smart Contracts**: $500-1,000
- Deployment fees: $100
- Testing: $200
- Audit: $500-1,000 (or free community audit)

**Total**: $10,550-16,050

**Funding Source**: NFT sales revenue

---

## Success Criteria

### Month 1
- ✅ 100+ CATH holders
- ✅ $10K+ liquidity
- ✅ 50+ NFT unlocks
- ✅ 30%+ staking participation

### Month 3
- ✅ 500+ CATH holders
- ✅ $50K+ liquidity
- ✅ 200+ NFT unlocks
- ✅ 50%+ staking participation

### Month 6
- ✅ 1,000+ CATH holders
- ✅ $100K+ liquidity
- ✅ 500+ NFT unlocks
- ✅ 60%+ staking participation

---

## Next Steps

1. **Verify token supply** on-chain
2. **Create distribution wallets**
3. **Set up multi-sig treasury**
4. **Deploy smart contracts** to devnet
5. **Test all functions** thoroughly
6. **Add liquidity** on Raydium
7. **Launch utility** and monitor

**Ready to start? Let's verify the token supply first!**

```bash
# Run this command to check token details
spl-token display 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA
```
