# Early Unlock Test Plan

## Overview

Test plan for validating the early unlock penalty (0 rewards) in the PANGI staking system.

---

## Test Scenarios

### Test 1: Normal Unlock (Full Duration)

**Setup**:
- Stake: 10,000 PANGI
- Lock Duration: 90 days
- APY: 12%
- Expected Rewards: 1,200 PANGI

**Steps**:
1. User deposits 10,000 PANGI
2. User stakes for 90 days
3. Wait 90 days (or warp time in test)
4. User withdraws tokens
5. User claims rewards

**Expected Results**:
- ✅ Withdrawal successful
- ✅ Principal returned: 10,000 PANGI
- ✅ Rewards claimable: 1,200 PANGI
- ✅ `is_early_unlock` = false in event
- ✅ No `EarlyUnlockEvent` emitted

---

### Test 2: Early Unlock (Halfway Through)

**Setup**:
- Stake: 10,000 PANGI
- Lock Duration: 90 days
- APY: 12%
- Total Potential Rewards: 296 PANGI
- Wait: 45 days (halfway)

**Steps**:
1. User deposits 10,000 PANGI
2. User stakes for 90 days
3. Wait 45 days (halfway)
4. User withdraws tokens

**Expected Results**:
- ✅ Withdrawal successful
- ✅ Principal returned: 10,000 PANGI
- ✅ Time Percentage: 50%
- ✅ Proportional Rewards: 148 PANGI (50% of 296)
- ✅ Penalty (15%): 22.2 PANGI
- ✅ User Payout: 125.8 PANGI
- ✅ `is_early_unlock` = true in event
- ✅ `EarlyUnlockEvent` emitted with:
  - `forfeited_rewards`: 22.2 PANGI (penalty to pool)
  - `days_early`: 45
  - `unlock_at`: original unlock timestamp
  - `unlocked_at`: current timestamp
- ✅ `TokensWithdrawnEvent` emitted with:
  - `pending_rewards`: 125.8 PANGI
  - `penalty_to_pool`: 22.2 PANGI
- ✅ Vault `total_penalties_collected` increased by 22.2 PANGI

---

### Test 3: Early Unlock (1 Day Early)

**Setup**:
- Stake: 10,000 PANGI
- Lock Duration: 90 days
- APY: 12%
- Total Potential Rewards: 296 PANGI
- Wait: 89 days (1 day early)

**Steps**:
1. User deposits 10,000 PANGI
2. User stakes for 90 days
3. Wait 89 days
4. User withdraws tokens

**Expected Results**:
- ✅ Withdrawal successful
- ✅ Principal returned: 10,000 PANGI
- ✅ Time Percentage: 98.9%
- ✅ Proportional Rewards: 292.7 PANGI (98.9% of 296)
- ✅ Penalty (15%): 43.9 PANGI
- ✅ User Payout: 248.8 PANGI
- ✅ `is_early_unlock` = true in event
- ✅ `EarlyUnlockEvent` emitted with:
  - `forfeited_rewards`: 43.9 PANGI (penalty to pool)
  - `days_early`: 1
- ✅ `TokensWithdrawnEvent` emitted with:
  - `pending_rewards`: 248.8 PANGI
  - `penalty_to_pool`: 43.9 PANGI

**Note**: Even 1 day early costs 43.9 PANGI penalty, but user still gets 248.8 PANGI (84% of full rewards)!

---

### Test 4: Early Unlock (Very Early)

**Setup**:
- Stake: 10,000 PANGI
- Lock Duration: 90 days
- APY: 12%
- Wait: 1 day (very early)

**Steps**:
1. User deposits 10,000 PANGI
2. User stakes for 90 days
3. Wait 1 day
4. User withdraws tokens

**Expected Results**:
- ✅ Withdrawal successful
- ✅ Principal returned: 10,000 PANGI
- ❌ Rewards: 0 PANGI (forfeited)
- ✅ `is_early_unlock` = true in event
- ✅ `EarlyUnlockEvent` emitted with:
  - `forfeited_rewards`: ~13 PANGI (1 day worth)
  - `days_early`: 89

---

### Test 5: Claim Rewards Before Unlock (Should Fail)

**Setup**:
- Stake: 10,000 PANGI
- Lock Duration: 90 days
- Wait: 45 days (not yet unlocked)

**Steps**:
1. User deposits 10,000 PANGI
2. User stakes for 90 days
3. Wait 45 days
4. User attempts to claim rewards (without withdrawing)

**Expected Results**:
- ❌ Claim fails with error: `StillLocked`
- ✅ Error message: "Tokens are still locked"
- ✅ No rewards transferred

---

### Test 6: Multiple Stakes with Mixed Unlocks

**Setup**:
- Stake 1: 5,000 PANGI, 30 days
- Stake 2: 10,000 PANGI, 90 days
- Stake 3: 15,000 PANGI, 180 days

**Steps**:
1. User creates 3 separate stakes
2. Wait 35 days
3. Stake 1: Withdraw after full duration (normal unlock)
4. Stake 2: Withdraw early (55 days remaining)
5. Stake 3: Keep staking (145 days remaining)

**Expected Results**:
- Stake 1:
  - ✅ Principal: 5,000 PANGI
  - ✅ Rewards: 250 PANGI (5% APY for 30 days)
  - ✅ `is_early_unlock` = false
- Stake 2:
  - ✅ Principal: 10,000 PANGI
  - ❌ Rewards: 0 PANGI (forfeited)
  - ✅ `is_early_unlock` = true
  - ✅ `forfeited_rewards`: ~420 PANGI
- Stake 3:
  - ⏳ Still locked
  - ⏳ Rewards accumulating

---

### Test 7: Statistics Tracking

**Setup**:
- Multiple stakes with early unlocks

**Steps**:
1. Create 5 stakes
2. 2 stakes: early unlock
3. 3 stakes: normal unlock
4. Query global statistics

**Expected Results**:
- ✅ `total_stakes_completed`: 3
- ✅ `total_early_unlocks`: 2
- ✅ `total_rewards_forfeited`: sum of forfeited amounts
- ✅ `total_rewards_paid`: only rewards from normal unlocks
- ✅ `early_unlocks_today`: 2
- ✅ `early_unlocks_this_week`: 2
- ✅ `early_unlocks_this_month`: 2

---

## Implementation Notes

### Rust Test Structure

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;
    
    #[test]
    fn test_normal_unlock() {
        // Test 1 implementation
    }
    
    #[test]
    fn test_early_unlock_halfway() {
        // Test 2 implementation
    }
    
    #[test]
    fn test_early_unlock_one_day_early() {
        // Test 3 implementation
    }
    
    #[test]
    fn test_early_unlock_very_early() {
        // Test 4 implementation
    }
    
    #[test]
    fn test_claim_before_unlock_fails() {
        // Test 5 implementation
    }
    
    #[test]
    fn test_multiple_stakes_mixed_unlocks() {
        // Test 6 implementation
    }
    
    #[test]
    fn test_statistics_tracking() {
        // Test 7 implementation
    }
}
```

### TypeScript Test Structure

```typescript
describe("Early Unlock Tests", () => {
  it("should allow normal unlock with full rewards", async () => {
    // Test 1 implementation
  });
  
  it("should forfeit all rewards on early unlock (halfway)", async () => {
    // Test 2 implementation
  });
  
  it("should forfeit all rewards even 1 day early", async () => {
    // Test 3 implementation
  });
  
  it("should forfeit minimal rewards on very early unlock", async () => {
    // Test 4 implementation
  });
  
  it("should fail to claim rewards before unlock", async () => {
    // Test 5 implementation
  });
  
  it("should handle multiple stakes with mixed unlocks", async () => {
    // Test 6 implementation
  });
  
  it("should track early unlock statistics correctly", async () => {
    // Test 7 implementation
  });
});
```

---

## Edge Cases to Test

### Edge Case 1: Unlock Exactly at unlock_at
- Withdraw at exactly `unlock_at` timestamp
- Should be treated as normal unlock (not early)
- Full rewards should be available

### Edge Case 2: Unlock 1 Second Early
- Withdraw at `unlock_at - 1` second
- Should be treated as early unlock
- 0 rewards (harsh but fair)

### Edge Case 3: Zero Stake Amount
- Attempt to stake 0 tokens
- Should fail with `AmountTooSmall` error

### Edge Case 4: Withdraw More Than Staked
- Stake 1,000 PANGI
- Attempt to withdraw 2,000 PANGI
- Should fail with `InsufficientStake` error

### Edge Case 5: Claim Rewards Twice
- Claim rewards once
- Attempt to claim again
- Should fail with `NoRewardsToClaim` error

### Edge Case 6: Withdraw After Claiming
- Claim rewards first
- Then withdraw principal
- Both should succeed independently

---

## Performance Tests

### Test 1: Large Number of Stakes
- Create 1,000 stakes
- Mix of early and normal unlocks
- Verify statistics accuracy
- Check gas costs

### Test 2: Maximum Stake Amount
- Stake maximum allowed amount
- Verify reward calculations don't overflow
- Test early unlock with max amount

### Test 3: Minimum Stake Amount
- Stake minimum allowed amount
- Verify reward calculations work correctly
- Test early unlock with min amount

---

## Security Tests

### Test 1: Unauthorized Withdrawal
- User A stakes tokens
- User B attempts to withdraw User A's tokens
- Should fail with `Unauthorized` error

### Test 2: Unauthorized Claim
- User A stakes tokens
- User B attempts to claim User A's rewards
- Should fail with `Unauthorized` error

### Test 3: Guardian Cannot Withdraw
- Guardian monitors stake
- Guardian attempts to withdraw user's tokens
- Should fail with `Unauthorized` error

### Test 4: Reentrancy Protection
- Attempt to call withdraw during withdraw
- Should fail or be prevented by Anchor

---

## Integration Tests

### Test 1: Full User Journey
1. Mint Master NFT
2. Create staking subdomain
3. Deposit PANGI
4. Stake tokens
5. Wait partial duration
6. Early unlock (verify 0 rewards)
7. Stake again
8. Wait full duration
9. Normal unlock (verify full rewards)

### Test 2: Guardian Reporting
1. User stakes tokens
2. Guardian monitors
3. User early unlocks
4. Guardian reports early unlock event
5. Verify report sent to public address
6. Verify no inbound data to Guardian

---

## Test Data

### Sample Calculations

**30 Days, 5% APY**:
- Stake: 10,000 PANGI
- Daily: 1.37 PANGI
- Total: 41 PANGI
- Early (15 days): 0 PANGI (forfeit 20.5 PANGI)

**90 Days, 12% APY**:
- Stake: 10,000 PANGI
- Daily: 3.29 PANGI
- Total: 296 PANGI
- Early (45 days): 0 PANGI (forfeit 148 PANGI)

**365 Days, 25% APY**:
- Stake: 10,000 PANGI
- Daily: 6.85 PANGI
- Total: 2,500 PANGI
- Early (182 days): 0 PANGI (forfeit 1,247 PANGI)

---

## Success Criteria

All tests must pass with:
- ✅ Correct principal amounts returned
- ✅ Correct reward amounts (0 for early, full for normal)
- ✅ Correct event emissions
- ✅ Correct statistics tracking
- ✅ No security vulnerabilities
- ✅ Gas costs within acceptable range
- ✅ No arithmetic overflows/underflows
- ✅ Proper error handling

---

## Test Execution

### Local Testing
```bash
# Run Rust tests
cd programs/pangi-vault
cargo test

# Run TypeScript tests
anchor test
```

### Devnet Testing
```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run integration tests
anchor test --provider.cluster devnet
```

### Mainnet Preparation
- All tests pass on localnet
- All tests pass on devnet
- Security audit completed
- Gas optimization verified
- Documentation complete
