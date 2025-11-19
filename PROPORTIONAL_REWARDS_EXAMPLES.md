# Proportional Rewards with 15% Penalty - Examples

## Overview

When users unlock early, they receive:
- **Proportional rewards** based on time staked
- **Minus 15% penalty** that returns to the reward pool
- **Full principal** always returned

---

## Formula

```
time_percentage = time_staked / lock_duration
proportional_rewards = time_percentage × total_potential_rewards
penalty = proportional_rewards × 0.15
user_payout = proportional_rewards × 0.85
reward_pool += penalty
```

---

## Example 1: 30-Day Stake

### Setup
- **Stake Amount**: 10,000 PANGI
- **Lock Duration**: 30 days
- **APY**: 5%
- **Total Potential Rewards**: 41 PANGI

### Scenario A: Full Duration (30 days)
```
Time Staked: 30 days (100%)
Time Percentage: 100%
Proportional Rewards: 41 PANGI
Penalty: 0 PANGI (no penalty for full duration)
User Payout: 41 PANGI ✅
To Pool: 0 PANGI
```

### Scenario B: Early Unlock at 15 days (50%)
```
Time Staked: 15 days (50%)
Time Percentage: 50%
Proportional Rewards: 20.5 PANGI
Penalty: 3.08 PANGI (15% of 20.5)
User Payout: 17.42 PANGI ✅
To Pool: 3.08 PANGI
```

### Scenario C: Early Unlock at 7 days (23.3%)
```
Time Staked: 7 days (23.3%)
Time Percentage: 23.3%
Proportional Rewards: 9.55 PANGI
Penalty: 1.43 PANGI (15% of 9.55)
User Payout: 8.12 PANGI ✅
To Pool: 1.43 PANGI
```

---

## Example 2: 90-Day Stake

### Setup
- **Stake Amount**: 10,000 PANGI
- **Lock Duration**: 90 days
- **APY**: 12%
- **Total Potential Rewards**: 296 PANGI

### Scenario A: Full Duration (90 days)
```
Time Staked: 90 days (100%)
Time Percentage: 100%
Proportional Rewards: 296 PANGI
Penalty: 0 PANGI (no penalty for full duration)
User Payout: 296 PANGI ✅
To Pool: 0 PANGI
```

### Scenario B: Early Unlock at 45 days (50%)
```
Time Staked: 45 days (50%)
Time Percentage: 50%
Proportional Rewards: 148 PANGI
Penalty: 22.2 PANGI (15% of 148)
User Payout: 125.8 PANGI ✅
To Pool: 22.2 PANGI
```

### Scenario C: Early Unlock at 60 days (66.7%)
```
Time Staked: 60 days (66.7%)
Time Percentage: 66.7%
Proportional Rewards: 197.4 PANGI
Penalty: 29.6 PANGI (15% of 197.4)
User Payout: 167.8 PANGI ✅
To Pool: 29.6 PANGI
```

### Scenario D: Early Unlock at 89 days (98.9%)
```
Time Staked: 89 days (98.9%)
Time Percentage: 98.9%
Proportional Rewards: 292.7 PANGI
Penalty: 43.9 PANGI (15% of 292.7)
User Payout: 248.8 PANGI ✅
To Pool: 43.9 PANGI

Note: Even 1 day early costs 43.9 PANGI penalty!
```

---

## Example 3: 180-Day Stake

### Setup
- **Stake Amount**: 10,000 PANGI
- **Lock Duration**: 180 days
- **APY**: 18%
- **Total Potential Rewards**: 493 PANGI

### Scenario A: Full Duration (180 days)
```
Time Staked: 180 days (100%)
Time Percentage: 100%
Proportional Rewards: 493 PANGI
Penalty: 0 PANGI (no penalty for full duration)
User Payout: 493 PANGI ✅
To Pool: 0 PANGI
```

### Scenario B: Early Unlock at 90 days (50%)
```
Time Staked: 90 days (50%)
Time Percentage: 50%
Proportional Rewards: 246.5 PANGI
Penalty: 37 PANGI (15% of 246.5)
User Payout: 209.5 PANGI ✅
To Pool: 37 PANGI
```

### Scenario C: Early Unlock at 120 days (66.7%)
```
Time Staked: 120 days (66.7%)
Time Percentage: 66.7%
Proportional Rewards: 328.8 PANGI
Penalty: 49.3 PANGI (15% of 328.8)
User Payout: 279.5 PANGI ✅
To Pool: 49.3 PANGI
```

---

## Example 4: 365-Day Stake

### Setup
- **Stake Amount**: 10,000 PANGI
- **Lock Duration**: 365 days
- **APY**: 25%
- **Total Potential Rewards**: 2,500 PANGI

### Scenario A: Full Duration (365 days)
```
Time Staked: 365 days (100%)
Time Percentage: 100%
Proportional Rewards: 2,500 PANGI
Penalty: 0 PANGI (no penalty for full duration)
User Payout: 2,500 PANGI ✅
To Pool: 0 PANGI
```

### Scenario B: Early Unlock at 182 days (50%)
```
Time Staked: 182 days (50%)
Time Percentage: 50%
Proportional Rewards: 1,250 PANGI
Penalty: 187.5 PANGI (15% of 1,250)
User Payout: 1,062.5 PANGI ✅
To Pool: 187.5 PANGI
```

### Scenario C: Early Unlock at 273 days (75%)
```
Time Staked: 273 days (75%)
Time Percentage: 75%
Proportional Rewards: 1,875 PANGI
Penalty: 281.25 PANGI (15% of 1,875)
User Payout: 1,593.75 PANGI ✅
To Pool: 281.25 PANGI
```

### Scenario D: Early Unlock at 364 days (99.7%)
```
Time Staked: 364 days (99.7%)
Time Percentage: 99.7%
Proportional Rewards: 2,493 PANGI
Penalty: 374 PANGI (15% of 2,493)
User Payout: 2,119 PANGI ✅
To Pool: 374 PANGI

Note: 1 day early costs 374 PANGI penalty on a year-long stake!
```

---

## Large Stake Examples

### Example 5: 100,000 PANGI for 90 Days

**Setup**:
- Stake: 100,000 PANGI
- Lock: 90 days at 12% APY
- Total Potential: 2,960 PANGI

**Early Unlock at 45 days (50%)**:
```
Proportional Rewards: 1,480 PANGI
Penalty: 222 PANGI (15%)
User Payout: 1,258 PANGI ✅
To Pool: 222 PANGI
```

### Example 6: 1,000,000 PANGI for 365 Days

**Setup**:
- Stake: 1,000,000 PANGI
- Lock: 365 days at 25% APY
- Total Potential: 250,000 PANGI

**Early Unlock at 182 days (50%)**:
```
Proportional Rewards: 125,000 PANGI
Penalty: 18,750 PANGI (15%)
User Payout: 106,250 PANGI ✅
To Pool: 18,750 PANGI

Note: 18,750 PANGI penalty returns to pool for future stakers!
```

---

## Comparison Table: Early Unlock Penalties

| Lock Duration | Time Staked | % Complete | Proportional Rewards | Penalty (15%) | User Payout | To Pool |
|---------------|-------------|------------|---------------------|---------------|-------------|---------|
| 30 days | 15 days | 50% | 20.5 PANGI | 3.08 PANGI | 17.42 PANGI | 3.08 PANGI |
| 60 days | 30 days | 50% | 54.8 PANGI | 8.22 PANGI | 46.58 PANGI | 8.22 PANGI |
| 90 days | 45 days | 50% | 148 PANGI | 22.2 PANGI | 125.8 PANGI | 22.2 PANGI |
| 180 days | 90 days | 50% | 246.5 PANGI | 37 PANGI | 209.5 PANGI | 37 PANGI |
| 365 days | 182 days | 50% | 1,250 PANGI | 187.5 PANGI | 1,062.5 PANGI | 187.5 PANGI |

**Key Insight**: Longer lock durations have higher penalties in absolute terms, but the percentage is always 15%.

---

## Penalty Impact on Reward Pool

### Pool Growth from Penalties

If 100 users stake 10,000 PANGI each for 90 days (12% APY):
- Total Staked: 1,000,000 PANGI
- Total Potential Rewards: 29,600 PANGI

**Scenario: 20% of users unlock at 50% duration**:
```
20 users unlock early at 45 days:
- Each gets: 125.8 PANGI (proportional - 15%)
- Each penalty: 22.2 PANGI
- Total penalties to pool: 444 PANGI

80 users complete full duration:
- Each gets: 296 PANGI
- Total paid: 23,680 PANGI

Pool Impact:
- Rewards paid out: 23,680 + 2,516 = 26,196 PANGI
- Penalties returned: 444 PANGI
- Net pool usage: 25,752 PANGI (vs 29,600 potential)
- Pool savings: 3,848 PANGI (13% saved)
```

**Result**: Early unlock penalties make the reward pool more sustainable!

---

## User Decision Matrix

### Should I Unlock Early?

**Factors to Consider**:

1. **Time Remaining**:
   - \> 50% remaining: High penalty cost
   - 25-50% remaining: Moderate penalty cost
   - < 25% remaining: Lower penalty cost (but still 15%)

2. **Opportunity Cost**:
   - Can you earn more than 15% elsewhere?
   - Is liquidity worth the penalty?

3. **Penalty Amount**:
   - Small stakes: Penalty may be negligible
   - Large stakes: Penalty can be substantial

### Example Decision

**Scenario**: 10,000 PANGI staked for 90 days at 12% APY, 60 days remaining

```
If I unlock now (30 days in):
- Time Percentage: 33.3%
- Proportional Rewards: 98.7 PANGI
- Penalty: 14.8 PANGI
- User Payout: 83.9 PANGI

If I wait 60 more days:
- Full Rewards: 296 PANGI
- Penalty: 0 PANGI
- User Payout: 296 PANGI

Cost of Early Unlock:
- Lost rewards: 296 - 83.9 = 212.1 PANGI
- Effective penalty: 71.6% of potential rewards

Decision: Unless I can earn 212.1 PANGI elsewhere in 60 days, 
I should wait for full duration.
```

---

## Benefits of This Model

### For Users
- ✅ Fair: Get rewards for time actually staked
- ✅ Flexible: Can unlock early if needed
- ✅ Predictable: Know exact penalty before unlocking
- ✅ Transparent: All calculations on-chain

### For Protocol
- ✅ Sustainable: Penalties return to pool
- ✅ Incentivized: Encourages full duration staking
- ✅ Balanced: Not too harsh, not too lenient
- ✅ Growing: Pool grows from penalties

### For Community
- ✅ Fair distribution: Penalties benefit all stakers
- ✅ Long-term thinking: Rewards commitment
- ✅ Flexibility: Allows emergency exits
- ✅ Transparency: All penalties tracked on-chain

---

## Technical Implementation

### Smart Contract Calculation

```rust
fn calculate_early_unlock_rewards(
    staked_amount: u64,
    reward_rate: u16,
    staked_at: i64,
    unlock_at: i64,
    current_time: i64,
) -> Result<(u64, u64)> {
    // Time actually staked
    let time_staked = current_time - staked_at;
    
    // Total lock duration
    let lock_duration = unlock_at - staked_at;
    
    // Total potential rewards
    let total_potential = calculate_total_rewards(
        staked_amount,
        reward_rate,
        lock_duration,
    )?;
    
    // Proportional rewards
    let proportional = (total_potential * time_staked) / lock_duration;
    
    // 15% penalty
    let penalty = (proportional * 1500) / 10000;  // 1500 basis points = 15%
    
    // User payout
    let user_payout = proportional - penalty;
    
    // Return (user_payout, penalty)
    Ok((user_payout, penalty))
}
```

### Frontend Display

```typescript
function displayEarlyUnlockInfo(stake: StakePosition) {
  const now = Date.now() / 1000;
  const timeStaked = now - stake.stakedAt;
  const lockDuration = stake.unlockAt - stake.stakedAt;
  const timePercentage = (timeStaked / lockDuration) * 100;
  
  const totalPotential = calculateTotalRewards(stake);
  const proportional = totalPotential * (timeStaked / lockDuration);
  const penalty = proportional * 0.15;
  const userPayout = proportional * 0.85;
  
  return {
    timePercentage: `${timePercentage.toFixed(1)}%`,
    proportionalRewards: `${proportional.toFixed(2)} PANGI`,
    penalty: `${penalty.toFixed(2)} PANGI (15%)`,
    userPayout: `${userPayout.toFixed(2)} PANGI`,
    daysRemaining: ((stake.unlockAt - now) / 86400).toFixed(1),
  };
}
```

---

## Summary

The proportional rewards with 15% penalty model provides:

1. **Fairness**: Users get rewards for time staked
2. **Flexibility**: Can unlock early if needed
3. **Sustainability**: Penalties return to pool
4. **Incentive**: Encourages full duration commitment
5. **Transparency**: All calculations visible on-chain

**Key Takeaway**: The 15% penalty is fair enough to discourage frivolous early unlocks while not being so harsh that users feel trapped. The penalty returning to the pool benefits all stakers and makes the system more sustainable.
