# Staking Guide

Complete guide to staking PANGI NFTs and earning rewards.

## What is Staking?

Staking in PANGI allows you to:
- 🔒 **Lock your NFTs** in secure vaults
- 💰 **Earn PANGI tokens** as rewards
- ⭐ **Accumulate evolution points** to upgrade your NFT
- 🎯 **Participate in governance** (coming soon)

## How Staking Works

### The Basics

When you stake a PANGI NFT:
1. Your NFT is transferred to a vault (Program Derived Address)
2. The vault tracks your stake start time
3. Rewards accumulate every second based on vault rates
4. Evolution points accumulate simultaneously
5. You can claim rewards anytime
6. You can unstake anytime (no lock period)

### Reward Calculation

```javascript
// Rewards accumulate per second
const timeStaked = currentTime - stakeStartTime;  // in seconds
const rewards = timeStaked * vaultRewardRate;     // tokens earned
const evolutionPoints = timeStaked * vaultEvolutionRate;  // points earned
```

**Example:**
- Vault reward rate: 0.001 PANGI/second
- Vault evolution rate: 1 point/second
- Staked for: 1 day (86,400 seconds)
- **Rewards earned**: 86.4 PANGI
- **Evolution points**: 86,400 points

## Vault Types

PANGI offers multiple vault types with different reward rates:

### Standard Vault

**Best for:** Beginners, casual stakers

| Metric | Value |
|--------|-------|
| Reward Rate | 0.001 PANGI/sec |
| Evolution Rate | 1 point/sec |
| Daily Rewards | ~86.4 PANGI |
| Daily Points | ~86,400 points |
| Estimated APY | ~31.5% |

### Premium Vault

**Best for:** Active users, serious collectors

| Metric | Value |
|--------|-------|
| Reward Rate | 0.002 PANGI/sec |
| Evolution Rate | 2 points/sec |
| Daily Rewards | ~172.8 PANGI |
| Daily Points | ~172,800 points |
| Estimated APY | ~63% |

### Legendary Vault

**Best for:** Special 25 NFT holders

| Metric | Value |
|--------|-------|
| Reward Rate | 0.005 PANGI/sec |
| Evolution Rate | 5 points/sec |
| Daily Rewards | ~432 PANGI |
| Daily Points | ~432,000 points |
| Estimated APY | ~157.5% |
| Requirements | Special 25 NFT |

## Staking Your NFT

### Prerequisites

- ✅ Connected wallet (Phantom/Solflare)
- ✅ At least one PANGI NFT
- ✅ ~0.01 SOL for transaction fees
- ✅ Wallet on Devnet (for testing)

### Step-by-Step Process

#### 1. Navigate to Staking Section

```
dApp → Stake → Select NFT
```

#### 2. Choose Your NFT

- View all your PANGI NFTs
- Check current tier and evolution points
- Select the NFT you want to stake

#### 3. Select Vault

Choose a vault based on:
- **Reward rate** - Higher = more tokens
- **Evolution rate** - Higher = faster evolution
- **Availability** - Some vaults may be full

#### 4. Review Details

Before confirming, review:
- NFT being staked
- Vault type and rates
- Estimated daily rewards
- Estimated daily evolution points

#### 5. Approve Transaction

- Click "Stake NFT"
- Wallet popup appears
- Review transaction details
- Approve in wallet
- Wait for confirmation (~1-2 seconds)

#### 6. Confirmation

You'll see:
- ✅ Transaction successful
- Stake start time
- Current rewards: 0 PANGI
- Current points: 0

### Example Transaction

```typescript
// What happens behind the scenes
const tx = await program.methods
  .stakeNft()
  .accounts({
    owner: wallet.publicKey,
    vault: vaultPDA,
    stakeAccount: stakeAccountPDA,
    nftMint: nftMint.publicKey,
    nftTokenAccount: ownerNftAccount,
    vaultNftAccount: vaultNftAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Monitoring Your Stakes

### Dashboard Overview

Your staking dashboard shows:
- **Active Stakes** - All currently staked NFTs
- **Total Rewards** - Accumulated PANGI tokens
- **Total Points** - Evolution points earned
- **Time Staked** - Duration for each NFT
- **Estimated Daily** - Projected earnings

### Real-Time Updates

Rewards update:
- Every second (on-chain)
- Every 10 seconds (UI refresh)
- Instantly when you claim

### Checking Specific Stake

```
Dashboard → My Stakes → Select NFT
```

You'll see:
- NFT details (tier, image)
- Vault type
- Stake start time
- Time staked (live counter)
- Claimable rewards
- Accumulated points
- Estimated time to next evolution

## Claiming Rewards

### When to Claim

You can claim anytime, but consider:
- **Gas costs** - Each claim costs ~0.000005 SOL
- **Compound strategy** - Claim less often to save on fees
- **Evolution timing** - Claim points when ready to evolve

### Claim Process

#### 1. Navigate to Claims

```
Dashboard → My Stakes → Claim Rewards
```

#### 2. Select What to Claim

Options:
- **Claim Tokens** - Withdraw PANGI to wallet
- **Claim Points** - Apply to NFT for evolution
- **Claim Both** - Get tokens and points

#### 3. Review Amounts

Before claiming:
- Check claimable amount
- Verify gas fee
- Confirm destination

#### 4. Approve Transaction

- Click "Claim"
- Approve in wallet
- Wait for confirmation

#### 5. Verify Receipt

Check:
- PANGI balance increased
- Evolution points applied to NFT
- Stake continues (not unstaked)

### Claim Strategies

**Frequent Claimer:**
- Claim daily
- Maximize liquidity
- Higher gas costs
- Good for: Active traders

**Compound Strategy:**
- Claim weekly/monthly
- Lower gas costs
- Points accumulate faster
- Good for: Long-term holders

**Evolution Focus:**
- Claim only when ready to evolve
- Minimize transactions
- Maximize point accumulation
- Good for: NFT collectors

## Evolution Through Staking

### Evolution Requirements

| Tier | Points Needed | Staking Time (Standard Vault) |
|------|---------------|-------------------------------|
| Egg → Baby | 100 | ~1.7 minutes |
| Baby → Juvenile | 500 | ~8.3 minutes |
| Juvenile → Adult | 2,000 | ~33 minutes |
| Adult → Legendary | 10,000 | ~2.8 hours |

### Evolution Process

1. **Accumulate Points**
   - Stake your NFT
   - Wait for points to accumulate
   - Monitor progress in dashboard

2. **Claim Points**
   - Navigate to "Claim Points"
   - Approve transaction
   - Points applied to NFT

3. **Evolve NFT**
   - Go to "Evolve" section
   - Select NFT with sufficient points
   - Click "Evolve"
   - Approve transaction
   - NFT upgrades to next tier!

4. **Continue Staking**
   - NFT remains staked
   - Continue earning at same rate
   - Work toward next tier

### Evolution Benefits

Each tier upgrade provides:
- 🎨 **New artwork** - Unique visual for each tier
- 💎 **Higher value** - Rarer NFTs worth more
- 🏆 **Status** - Show off your dedication
- 🎁 **Future perks** - Tier-based benefits (coming soon)

## Unstaking Your NFT

### When to Unstake

Consider unstaking when:
- You want to sell/transfer the NFT
- You need liquidity
- You want to switch vaults
- You're done with the project

### Unstaking Process

#### 1. Navigate to Unstake

```
Dashboard → My Stakes → Select NFT → Unstake
```

#### 2. Claim Pending Rewards

**Important:** Claim rewards before unstaking!
- Unclaimed rewards are lost on unstake
- Claim tokens and points first
- Then proceed with unstake

#### 3. Confirm Unstake

- Review NFT details
- Confirm you've claimed rewards
- Click "Unstake NFT"
- Approve transaction

#### 4. Receive NFT

- NFT returns to your wallet
- Check wallet to verify
- Evolution points remain on NFT
- Can restake anytime

### No Lock Period

Unlike many staking systems:
- ❌ **No cooldown period**
- ❌ **No unstaking penalty**
- ❌ **No minimum stake time**
- ✅ **Instant unstaking**

You can unstake anytime without waiting!

## Advanced Strategies

### Multi-NFT Staking

**Strategy:** Stake multiple NFTs across different vaults

**Benefits:**
- Diversified reward rates
- Risk mitigation
- Faster evolution for priority NFTs

**Example:**
- NFT #1 → Premium Vault (fast evolution)
- NFT #2 → Standard Vault (steady rewards)
- NFT #3 → Legendary Vault (max rewards)

### Compound Staking

**Strategy:** Reinvest rewards into more NFTs

**Process:**
1. Stake initial NFT
2. Claim PANGI rewards
3. Use rewards to mint new NFT
4. Stake new NFT
5. Repeat

**Benefits:**
- Exponential growth
- More NFTs = more rewards
- Build collection over time

### Evolution Ladder

**Strategy:** Evolve NFTs in sequence

**Process:**
1. Stake all NFTs
2. Focus points on one NFT
3. Evolve to Legendary
4. Move to next NFT
5. Repeat

**Benefits:**
- Systematic progression
- Clear goals
- Maximize tier diversity

### Vault Rotation

**Strategy:** Switch vaults based on goals

**When to rotate:**
- Need fast evolution → Premium Vault
- Want steady income → Standard Vault
- Have Special 25 → Legendary Vault

**Process:**
1. Unstake from current vault
2. Claim all rewards
3. Stake in new vault
4. Continue earning

## Reward Calculations

### Daily Rewards

```javascript
// Standard Vault
const dailyRewards = 0.001 * 86400 = 86.4 PANGI
const dailyPoints = 1 * 86400 = 86,400 points

// Premium Vault
const dailyRewards = 0.002 * 86400 = 172.8 PANGI
const dailyPoints = 2 * 86400 = 172,800 points

// Legendary Vault
const dailyRewards = 0.005 * 86400 = 432 PANGI
const dailyPoints = 5 * 86400 = 432,000 points
```

### APY Calculation

```javascript
// Assuming 1 NFT staked, PANGI price = $0.10
const nftValue = 1000; // $1000 NFT
const dailyRewards = 86.4; // PANGI
const dailyValue = dailyRewards * 0.10; // $8.64
const yearlyValue = dailyValue * 365; // $3,153.60
const apy = (yearlyValue / nftValue) * 100; // 315.36%

// Note: APY varies with PANGI price
```

### Time to Evolution

```javascript
// Calculate time needed for evolution
function timeToEvolve(currentPoints, targetPoints, evolutionRate) {
  const pointsNeeded = targetPoints - currentPoints;
  const secondsNeeded = pointsNeeded / evolutionRate;
  const hoursNeeded = secondsNeeded / 3600;
  return hoursNeeded;
}

// Example: Egg to Baby in Standard Vault
timeToEvolve(0, 100, 1); // 0.028 hours = ~1.7 minutes

// Example: Adult to Legendary in Premium Vault
timeToEvolve(0, 10000, 2); // 1.39 hours
```

## Troubleshooting

### "Insufficient SOL for transaction"

**Solution:**
```bash
# Get more devnet SOL
solana airdrop 1 --url devnet
```

### "NFT not found"

**Causes:**
- NFT not in your wallet
- Wrong network (mainnet vs devnet)
- NFT already staked

**Solution:**
- Check wallet contents
- Verify network in wallet
- Check "My Stakes" section

### "Transaction failed"

**Common causes:**
1. Insufficient SOL for fees
2. Network congestion
3. Wallet not connected
4. Wrong vault selected

**Solutions:**
1. Get more SOL
2. Wait 30 seconds and retry
3. Reconnect wallet
4. Select available vault

### "Rewards not updating"

**Solution:**
- Refresh the page
- Wait 10 seconds for next update
- Check transaction on Solana Explorer
- Verify stake is active

### "Can't claim rewards"

**Causes:**
- No rewards accumulated yet
- Insufficient SOL for gas
- Stake account not found

**Solutions:**
- Wait longer (minimum 1 second staked)
- Get more SOL
- Verify stake in dashboard

## Best Practices

### Security

- ✅ Never share your wallet seed phrase
- ✅ Verify transaction details before approving
- ✅ Use hardware wallet for large holdings
- ✅ Keep wallet software updated
- ✅ Bookmark official dApp URL

### Optimization

- 📊 Track your APY regularly
- 💰 Claim rewards during low gas times
- 🎯 Set evolution goals
- 📈 Monitor PANGI price for optimal claims
- 🔄 Rotate vaults based on strategy

### Risk Management

- 🎲 Don't stake your entire collection
- 💼 Diversify across vault types
- 📉 Have exit strategy
- 🔍 Monitor vault health
- ⚖️ Balance rewards vs evolution

## FAQ

### How often should I claim rewards?

**Answer:** Depends on your strategy:
- **Daily:** If you need liquidity
- **Weekly:** Good balance of gas vs rewards
- **Monthly:** Minimize gas costs
- **On evolution:** When ready to upgrade

### Can I lose my NFT by staking?

**Answer:** No! Your NFT is:
- Held in a secure PDA (Program Derived Address)
- Only you can unstake it
- Protected by Solana's security
- Recoverable even if dApp goes down

### What happens if I unstake before claiming?

**Answer:** You lose unclaimed rewards!
- Always claim before unstaking
- Check "Claimable" amount
- Claim tokens and points
- Then unstake

### Can I stake the same NFT in multiple vaults?

**Answer:** No, one NFT can only be in one vault at a time.
- Must unstake from current vault
- Then stake in new vault
- No penalty for switching

### Do rewards compound automatically?

**Answer:** No, you must manually claim and restake.
- Rewards accumulate linearly
- Claim when you want
- Use rewards to mint more NFTs
- Stake new NFTs for compound effect

### What's the minimum stake time?

**Answer:** No minimum!
- Stake for 1 second if you want
- Rewards accumulate per second
- Unstake anytime
- No penalties

## Next Steps

Now that you understand staking:

1. **[Get Started](./getting-started.md)** - Set up your wallet
2. **[Mint an NFT](#)** *(Coming Soon)* - Get your first PANGI NFT
3. **[Start Staking](#)** - Put your NFT to work
4. **[Track Evolution](#)** - Monitor your progress

## Resources

- 📖 [Architecture Docs](../developer-docs/architecture.md) - Technical details
- 🔧 [Program Reference](../developer-docs/program-reference.md) - Vault program API
- 💬 [Discord](#) - Community support
- 🐦 [Twitter](#) - Updates and announcements

---

**Happy Staking!** 🚀 Start earning rewards and evolving your PANGI NFTs today!
