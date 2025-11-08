# Governance Guide

Complete guide to participating in PANGI protocol governance.

## What is Governance?

PANGI governance allows token holders to:
- 🗳️ **Vote on proposals** - Shape the protocol's future
- 📝 **Create proposals** - Suggest changes and improvements
- 💰 **Control treasury** - Decide fund allocation
- ⚙️ **Update parameters** - Adjust protocol settings
- 🤝 **Community decisions** - Decentralized control

## Governance Model

### Decentralized Autonomous Organization (DAO)

PANGI uses a token-based governance model:
- **Token holders** = Governance participants
- **Voting power** = Based on staked tokens
- **Proposals** = Community-driven changes
- **Execution** = Automatic on-chain implementation

### Governance Principles

1. **Transparency** - All proposals and votes are public
2. **Inclusivity** - Any token holder can participate
3. **Security** - Time delays prevent rushed decisions
4. **Fairness** - One token = one vote (with bonuses)
5. **Efficiency** - Streamlined proposal process

## Voting Power

Your voting power is calculated from multiple factors:

### Base Voting Power

```javascript
// Basic calculation
baseVotingPower = stakedPANGI * 1
```

**Example:**
- Staked: 1,000 PANGI
- Base power: 1,000 votes

### Time Staked Multiplier

Longer stakes = more voting power:

| Time Staked | Multiplier | Example (1,000 PANGI) |
|-------------|------------|----------------------|
| 0-30 days | 1.0x | 1,000 votes |
| 31-90 days | 1.25x | 1,250 votes |
| 91-180 days | 1.5x | 1,500 votes |
| 181-365 days | 1.75x | 1,750 votes |
| 365+ days | 2.0x | 2,000 votes |

```javascript
// Time multiplier calculation
function getTimeMultiplier(daysStaked) {
  if (daysStaked < 31) return 1.0;
  if (daysStaked < 91) return 1.25;
  if (daysStaked < 181) return 1.5;
  if (daysStaked < 366) return 1.75;
  return 2.0;
}
```

### NFT Bonus

Holding PANGI NFTs increases voting power:

| NFT Tier | Bonus per NFT | Max NFTs Counted |
|----------|---------------|------------------|
| Egg | +50 votes | 10 |
| Baby | +100 votes | 10 |
| Juvenile | +250 votes | 10 |
| Adult | +500 votes | 10 |
| Legendary | +1,000 votes | 10 |
| Special 25 | +5,000 votes | 1 |

```javascript
// NFT bonus calculation
function getNFTBonus(nfts) {
  let bonus = 0;
  const tierBonus = {
    'Egg': 50,
    'Baby': 100,
    'Juvenile': 250,
    'Adult': 500,
    'Legendary': 1000,
    'Special25': 5000
  };
  
  // Count up to 10 NFTs per tier
  for (const [tier, count] of Object.entries(nfts)) {
    const countedNFTs = Math.min(count, tier === 'Special25' ? 1 : 10);
    bonus += countedNFTs * tierBonus[tier];
  }
  
  return bonus;
}
```

### Total Voting Power

```javascript
// Complete calculation
totalVotingPower = (stakedPANGI * timeMultiplier) + nftBonus
```

**Example:**
- Staked: 10,000 PANGI
- Time staked: 200 days (1.75x multiplier)
- NFTs: 2 Legendary, 1 Special 25
- **Calculation:**
  - Base: 10,000 × 1.75 = 17,500
  - NFT bonus: (2 × 1,000) + 5,000 = 7,000
  - **Total: 24,500 votes**

## Proposal Types

### 1. Parameter Changes

Adjust protocol settings:
- Tax rates (2-5%)
- Reward rates
- Evolution requirements
- Vault parameters

**Example:**
```
Title: Increase Standard Vault Reward Rate
Description: Increase from 0.001 to 0.0015 PANGI/sec
Impact: 50% higher rewards for standard stakers
```

### 2. Treasury Allocation

Control fund distribution:
- Conservation fund grants
- Development funding
- Marketing budget
- Community rewards

**Example:**
```
Title: Allocate 100,000 PANGI to Conservation Partner
Description: Fund pangolin habitat restoration project
Recipient: Wildlife Conservation Society
Amount: 100,000 PANGI
```

### 3. Feature Proposals

Add new functionality:
- New vault types
- Additional NFT tiers
- Integration partnerships
- UI/UX improvements

**Example:**
```
Title: Add Ultra Vault (5x rewards)
Description: Premium vault for holders of 5+ Legendary NFTs
Requirements: 5 Legendary NFTs minimum
Reward Rate: 0.025 PANGI/sec
```

### 4. Emergency Actions

Critical protocol changes:
- Pause/unpause contracts
- Update authorities
- Security fixes
- Emergency withdrawals

**Example:**
```
Title: Emergency Pause - Security Vulnerability
Description: Pause staking until vulnerability is patched
Duration: 24-48 hours
Reason: Critical security issue discovered
```

### 5. Meta-Governance

Changes to governance itself:
- Voting thresholds
- Proposal requirements
- Execution delays
- Quorum adjustments

**Example:**
```
Title: Reduce Quorum to 20%
Description: Lower participation requirement from 25% to 20%
Reason: Increase proposal success rate
```

## Creating Proposals

### Prerequisites

Before creating a proposal:
- ✅ Minimum 1,000 PANGI staked
- ✅ Wallet connected
- ✅ 10 PANGI for proposal fee
- ✅ Clear proposal idea

### Step-by-Step Process

#### 1. Navigate to Governance

```
dApp → Governance → Create Proposal
```

#### 2. Choose Proposal Type

Select from:
- Parameter Change
- Treasury Allocation
- Feature Proposal
- Emergency Action
- Meta-Governance

#### 3. Fill Proposal Details

**Required Fields:**

**Title** (max 100 characters)
```
Example: Increase Conservation Fund Allocation to 60%
```

**Description** (max 5,000 characters)
```markdown
## Summary
Increase conservation fund allocation from 50% to 60% of tax revenue.

## Motivation
- Support more conservation projects
- Increase real-world impact
- Strengthen brand mission

## Implementation
- Update tax distribution in token program
- New split: 60% conservation, 25% LP, 15% treasury
- Effective immediately upon execution

## Impact
- +20% more funds to conservation
- Reduced treasury allocation
- No impact on token holders
```

**Execution Actions** (if applicable)
```javascript
// For parameter changes
{
  program: "TokenProgram",
  instruction: "updateTaxConfig",
  accounts: [...],
  data: {
    conservationFundPercent: 60,
    liquidityPoolPercent: 25,
    treasuryPercent: 15
  }
}
```

**Voting Period**
- Minimum: 3 days
- Maximum: 7 days
- Recommended: 5 days

**Discussion Link** (optional)
```
https://forum.pangi.io/proposal/123
```

#### 4. Review and Submit

Before submitting:
- ✅ Proofread title and description
- ✅ Verify execution actions
- ✅ Check voting period
- ✅ Confirm proposal fee (10 PANGI)

#### 5. Pay Proposal Fee

- Click "Submit Proposal"
- Approve 10 PANGI transfer
- Approve proposal creation transaction
- Wait for confirmation

#### 6. Campaign for Votes

After submission:
- Share on Discord/Twitter
- Post in governance forum
- Explain benefits clearly
- Answer community questions
- Monitor voting progress

### Proposal Best Practices

**Do:**
- ✅ Be clear and concise
- ✅ Explain motivation
- ✅ Show impact analysis
- ✅ Provide implementation details
- ✅ Engage with community
- ✅ Address concerns

**Don't:**
- ❌ Rush the process
- ❌ Use vague language
- ❌ Ignore feedback
- ❌ Make unrealistic promises
- ❌ Spam multiple proposals
- ❌ Manipulate votes

## Voting Process

### Finding Proposals

#### Active Proposals

```
Governance → Active Proposals
```

Shows:
- Proposal title
- Creator
- Voting deadline
- Current results
- Your voting power

#### Filter Options

- **Status:** Active, Passed, Failed, Executed
- **Type:** All types or specific category
- **Sort:** Newest, Ending Soon, Most Votes

### Reviewing Proposals

Before voting, review:

**1. Proposal Details**
- Read full description
- Understand the change
- Check execution actions
- Review discussion

**2. Impact Analysis**
- Who benefits?
- Who is affected?
- What are the risks?
- Is it reversible?

**3. Community Sentiment**
- Check forum discussion
- Read Discord feedback
- Review Twitter comments
- Consider expert opinions

**4. Your Position**
- Does it align with your values?
- Will it benefit the protocol?
- Are there better alternatives?
- What's your confidence level?

### Casting Your Vote

#### 1. Select Proposal

Click on proposal to view details

#### 2. Choose Vote Option

Three options:
- **For** - Support the proposal
- **Against** - Oppose the proposal
- **Abstain** - Participate without taking a side

#### 3. Review Voting Power

Check:
- Your total voting power
- Breakdown (tokens + multiplier + NFTs)
- Impact on results

#### 4. Add Comment (Optional)

Explain your vote:
```
I'm voting FOR because this will increase conservation impact 
while maintaining protocol sustainability. The 60/25/15 split 
is well-balanced.
```

#### 5. Submit Vote

- Click "Cast Vote"
- Approve transaction
- Wait for confirmation
- Vote is recorded on-chain

#### 6. Monitor Results

Track:
- Live vote counts
- Percentage breakdown
- Time remaining
- Quorum progress

### Vote Delegation

Can't vote on every proposal? Delegate your voting power:

**How it works:**
1. Choose a trusted delegate
2. Delegate your voting power
3. They vote on your behalf
4. Revoke anytime

**To delegate:**
```
Governance → Delegate → Enter Address → Confirm
```

**Benefits:**
- Participate passively
- Support active community members
- Maintain governance influence
- Revocable anytime

## Proposal Lifecycle

### 1. Creation (Day 0)

- Proposal submitted
- Fee paid (10 PANGI)
- Voting period starts
- Community notified

### 2. Voting Period (Days 1-5)

- Community reviews proposal
- Votes are cast
- Discussion continues
- Results update live

### 3. Voting Ends (Day 5)

- No more votes accepted
- Final tally calculated
- Quorum checked
- Approval threshold checked

### 4. Success Criteria

For a proposal to pass:

**Quorum Requirement:**
```javascript
totalVotes >= (totalVotingPower * 0.25)  // 25% minimum
```

**Approval Threshold:**
```javascript
forVotes > againstVotes  // Simple majority
forVotes >= (totalVotes * 0.50)  // 50% of votes cast
```

**Example:**
- Total voting power: 1,000,000
- Votes cast: 300,000 (30% - quorum met ✅)
- For: 180,000 (60% - passed ✅)
- Against: 100,000 (33%)
- Abstain: 20,000 (7%)
- **Result: PASSED**

### 5. Execution Delay (Days 6-8)

If passed:
- 3-day timelock begins
- Community can review
- Emergency veto possible (multisig)
- Prepare for execution

### 6. Execution (Day 9)

- Anyone can trigger execution
- On-chain actions executed
- Changes take effect
- Proposal marked as executed

### 7. Post-Execution

- Monitor impact
- Gather feedback
- Document results
- Learn for future proposals

## Governance Parameters

### Current Settings

| Parameter | Value | Description |
|-----------|-------|-------------|
| Proposal Fee | 10 PANGI | Cost to create proposal |
| Min Stake | 1,000 PANGI | Minimum to create proposal |
| Voting Period | 3-7 days | Duration of voting |
| Quorum | 25% | Minimum participation |
| Approval | 50% | Votes needed to pass |
| Execution Delay | 3 days | Timelock after passing |
| Max Active Proposals | 10 | Concurrent proposals limit |

### Voting Power Caps

To prevent centralization:

| Holder Type | Max Voting Power |
|-------------|------------------|
| Single wallet | 5% of total |
| Delegated power | 10% of total |
| Team/Founders | 15% of total |

## Governance Treasury

### Treasury Holdings

Current allocation:
- **PANGI Tokens:** 20% of total supply
- **SOL:** For operational costs
- **Conservation Fund:** Separate allocation
- **LP Tokens:** Protocol-owned liquidity

### Treasury Usage

Funds can be allocated for:
- 🌍 Conservation projects
- 💻 Development grants
- 📢 Marketing campaigns
- 🎁 Community rewards
- 🔧 Infrastructure costs
- 🤝 Partnership funding

### Spending Proposals

To request treasury funds:

**1. Create detailed proposal:**
```markdown
## Funding Request: $50,000 for Mobile App

### Deliverables
- iOS app (App Store)
- Android app (Play Store)
- Wallet integration
- NFT gallery
- Staking interface

### Timeline
- Month 1: Design & planning
- Month 2-3: Development
- Month 4: Testing & launch

### Budget Breakdown
- Development: $35,000
- Design: $8,000
- Testing: $5,000
- Deployment: $2,000

### Team
- Lead Developer: [Portfolio]
- UI/UX Designer: [Portfolio]
- QA Engineer: [Portfolio]
```

**2. Provide milestones:**
- Clear deliverables
- Payment schedule
- Success metrics
- Accountability measures

**3. Campaign for support:**
- Present to community
- Answer questions
- Show credentials
- Build trust

## Advanced Governance

### Governance Attacks

Be aware of potential attacks:

**1. Vote Buying**
- Offering payment for votes
- Coordinated voting schemes
- **Defense:** Community vigilance, vote delegation

**2. Whale Manipulation**
- Large holders controlling votes
- **Defense:** Voting power caps, time-weighted voting

**3. Proposal Spam**
- Flooding with low-quality proposals
- **Defense:** Proposal fees, minimum stake requirement

**4. Last-Minute Voting**
- Swinging votes at deadline
- **Defense:** Execution delay, community monitoring

### Governance Participation Rewards

Earn rewards for active participation:

| Activity | Reward |
|----------|--------|
| Vote on proposal | 10 PANGI |
| Create passed proposal | 100 PANGI |
| Delegate votes | 5 PANGI/month |
| Forum participation | Variable |

**Claiming rewards:**
```
Governance → Rewards → Claim
```

### Emergency Governance

For critical situations:

**Emergency Multisig:**
- 5-of-7 multisig
- Can pause contracts
- Can veto proposals
- Time-limited powers

**When used:**
- Security vulnerabilities
- Exploit attempts
- Critical bugs
- Regulatory issues

**Transparency:**
- All actions logged
- Community notified immediately
- Explanation required
- Regular audits

## Governance Analytics

### Track Your Impact

**Personal Dashboard:**
```
Governance → My Activity
```

Shows:
- Proposals created
- Votes cast
- Voting power history
- Rewards earned
- Delegation status

### Protocol Analytics

**Governance Stats:**
- Total proposals: 47
- Passed: 32 (68%)
- Failed: 12 (26%)
- Active: 3 (6%)
- Average participation: 35%
- Total voters: 1,247

**Top Contributors:**
- Most proposals created
- Highest voting power
- Most consistent voters
- Best proposal success rate

## Best Practices

### For Voters

- 📖 Read proposals thoroughly
- 💬 Participate in discussions
- 🤔 Consider long-term impact
- ⚖️ Vote based on merit, not popularity
- 🔄 Stay informed on outcomes
- 🎯 Vote consistently

### For Proposal Creators

- 📝 Write clear proposals
- 📊 Provide data and analysis
- 💡 Explain benefits clearly
- 🗣️ Engage with community
- 🔍 Address concerns
- ⏰ Give adequate voting time

### For Delegates

- 🎯 Vote in line with delegators' interests
- 📢 Communicate voting decisions
- 🤝 Be transparent
- 📚 Stay informed
- ⚡ Vote promptly
- 🔄 Report regularly

## Troubleshooting

### "Insufficient voting power"

**Cause:** Not enough staked PANGI

**Solution:**
```bash
# Stake more PANGI
Staking → Stake Tokens → Confirm
```

### "Proposal creation failed"

**Causes:**
- Insufficient proposal fee
- Below minimum stake
- Too many active proposals

**Solutions:**
- Ensure 10 PANGI available
- Stake at least 1,000 PANGI
- Wait for other proposals to end

### "Vote not counted"

**Causes:**
- Voted after deadline
- Transaction failed
- Insufficient SOL for gas

**Solutions:**
- Check proposal deadline
- Retry transaction
- Get more SOL

### "Can't delegate votes"

**Causes:**
- Invalid delegate address
- Already delegated
- Insufficient voting power

**Solutions:**
- Verify address
- Revoke existing delegation first
- Stake more PANGI

## FAQ

### Can I change my vote?

**Answer:** No, votes are final once cast. Consider carefully before voting.

### What happens if quorum isn't met?

**Answer:** Proposal fails automatically, regardless of vote ratio.

### Can I vote with unstaked PANGI?

**Answer:** No, only staked PANGI counts toward voting power.

### How long does delegation last?

**Answer:** Until you revoke it. Delegation persists across proposals.

### What if a proposal passes but shouldn't execute?

**Answer:** 3-day execution delay allows emergency multisig to veto if needed.

### Can I create multiple proposals?

**Answer:** Yes, but max 3 active proposals per wallet at once.

## Governance Roadmap

### Phase 1: Current
- ✅ Basic voting
- ✅ Proposal creation
- ✅ Treasury control
- ✅ Parameter changes

### Phase 2: Q1 2025
- 🚧 Vote delegation
- 🚧 Governance rewards
- 🚧 Forum integration
- 🚧 Mobile voting

### Phase 3: Q2 2025
- 📅 Quadratic voting
- 📅 Conviction voting
- 📅 Governance mining
- 📅 Cross-chain governance

### Phase 4: Q3 2025
- 📅 Fully autonomous DAO
- 📅 AI-assisted proposals
- 📅 Predictive analytics
- 📅 Governance marketplace

## Resources

- 📖 [Getting Started](./getting-started.md) - PANGI basics
- 🔒 [Staking Guide](./staking-guide.md) - Increase voting power
- 💬 [Discord - #governance](https://discord.gg/pangi) - Discuss proposals
- 🌐 [Governance Forum](https://forum.pangi.io) - Detailed discussions
- 📊 [Analytics Dashboard](https://analytics.pangi.io) - Governance stats

---

**Shape PANGI's Future!** 🗳️ Your voice matters - participate in governance today!
