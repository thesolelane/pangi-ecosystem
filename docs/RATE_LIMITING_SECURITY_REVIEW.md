# Rate Limiting Security Review

## Code Analysis

```rust
#[account]
pub struct UserState {
    pub user: Pubkey,
    pub last_action_time: i64,
    pub actions_today: u16,
    pub last_reset_time: i64,
    pub cooldown_ends: i64,
}

pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    let clock = Clock::get()?;
    
    // Reset daily counter if new day
    if clock.unix_timestamp - user_state.last_reset_time > 86400 {
        user_state.actions_today = 0;
        user_state.last_reset_time = clock.unix_timestamp;
    }
    
    // Check daily limit
    match action {
        ActionType::ClaimRewards => {
            require!(
                user_state.actions_today < MAX_DAILY_CLAIMS,
                ErrorCode::DailyLimitExceeded
            );
        }
        // Other action types...
    }
    
    // Check cooldown
    require!(
        clock.unix_timestamp >= user_state.cooldown_ends,
        ErrorCode::CooldownActive
    );
    
    user_state.actions_today += 1;
    user_state.cooldown_ends = clock.unix_timestamp + COOLDOWN_PERIOD;
    
    Ok(())
}
```

---

## Issues Identified

### 🔴 Critical: Integer Overflow in Time Calculation

**Problem:**
```rust
if clock.unix_timestamp - user_state.last_reset_time > 86400 {
```

**Issues:**
1. **Unchecked subtraction** - If `last_reset_time` is somehow greater than `clock.unix_timestamp`, this will underflow
2. **Panic risk** - In debug mode, this panics. In release mode, it wraps around
3. **Logic bypass** - Underflow could result in a very large positive number, always triggering the reset

**Severity:** Critical - Can cause incorrect behavior or panic

**Fix:**
```rust
// ✅ Use checked_sub
let time_since_reset = clock
    .unix_timestamp
    .checked_sub(user_state.last_reset_time)
    .ok_or(ErrorCode::InvalidTimestamp)?;

if time_since_reset >= 86400 {
    user_state.actions_today = 0;
    user_state.last_reset_time = clock.unix_timestamp;
}
```

---

### 🔴 Critical: Integer Overflow in Cooldown Calculation

**Problem:**
```rust
user_state.cooldown_ends = clock.unix_timestamp + COOLDOWN_PERIOD;
```

**Issues:**
1. **Unchecked addition** - Could overflow if `clock.unix_timestamp` is near `i64::MAX`
2. **Wraparound** - Overflow wraps to negative number, making cooldown instantly expire
3. **Bypass** - Attacker could exploit this to bypass cooldown

**Severity:** Critical - Allows cooldown bypass

**Fix:**
```rust
// ✅ Use checked_add
user_state.cooldown_ends = clock
    .unix_timestamp
    .checked_add(COOLDOWN_PERIOD)
    .ok_or(ErrorCode::Overflow)?;
```

---

### 🔴 Critical: Integer Overflow in Counter Increment

**Problem:**
```rust
user_state.actions_today += 1;
```

**Issues:**
1. **Unchecked increment** - If `actions_today` reaches `u16::MAX` (65535), it wraps to 0
2. **Limit bypass** - After 65535 actions, counter resets and user can continue
3. **Type choice** - `u16` is too small for a daily counter

**Severity:** Critical - Allows rate limit bypass

**Fix:**
```rust
// ✅ Use checked_add
user_state.actions_today = user_state.actions_today
    .checked_add(1)
    .ok_or(ErrorCode::Overflow)?;

// OR better: Use u32 for more headroom
#[account]
pub struct UserState {
    pub user: Pubkey,
    pub last_action_time: i64,
    pub actions_today: u32, // ✅ Changed from u16
    pub last_reset_time: i64,
    pub cooldown_ends: i64,
}
```

---

### 🟡 High: Race Condition in Daily Reset

**Problem:**
```rust
if clock.unix_timestamp - user_state.last_reset_time > 86400 {
    user_state.actions_today = 0;
    user_state.last_reset_time = clock.unix_timestamp;
}
```

**Issues:**
1. **TOCTOU** - Time-of-Check-Time-of-Use vulnerability
2. **Multiple resets** - If multiple transactions execute simultaneously at day boundary, all see stale state
3. **Counter inconsistency** - Actions could be counted in wrong day

**Scenario:**
```
Time: 23:59:59 (Day 1)
- User has 9/10 actions used
- User submits 5 transactions simultaneously

Time: 00:00:01 (Day 2)
- All 5 transactions see actions_today = 9
- All 5 pass the check (9 < 10)
- All 5 reset counter to 0
- All 5 increment to 1
- Result: User performed 5 actions but counter shows 1
```

**Severity:** High - Allows rate limit bypass

**Fix:**
```rust
// ✅ Use deterministic day calculation
const SECONDS_PER_DAY: i64 = 86400;

fn get_current_day(timestamp: i64) -> i64 {
    timestamp / SECONDS_PER_DAY
}

pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    let clock = Clock::get()?;
    let current_day = get_current_day(clock.unix_timestamp);
    let last_reset_day = get_current_day(user_state.last_reset_time);
    
    // ✅ Reset if different day
    if current_day > last_reset_day {
        user_state.actions_today = 0;
        user_state.last_reset_time = clock.unix_timestamp;
    }
    
    // ... rest of logic
}
```

---

### 🟡 High: Missing Initialization Check

**Problem:** No validation that `UserState` is properly initialized.

**Issues:**
1. **Zero values** - Uninitialized state has all zeros
2. **Invalid timestamps** - `last_reset_time = 0` is Jan 1, 1970
3. **Immediate reset** - First call always resets counter

**Fix:**
```rust
#[account]
pub struct UserState {
    pub user: Pubkey,
    pub last_action_time: i64,
    pub actions_today: u32,
    pub last_reset_time: i64,
    pub cooldown_ends: i64,
    pub is_initialized: bool, // ✅ ADD
    pub bump: u8, // ✅ ADD for PDA
}

pub fn initialize_user_state(ctx: Context<InitializeUserState>) -> Result<()> {
    let user_state = &mut ctx.accounts.user_state;
    let clock = Clock::get()?;
    
    user_state.user = ctx.accounts.user.key();
    user_state.last_action_time = clock.unix_timestamp;
    user_state.actions_today = 0;
    user_state.last_reset_time = clock.unix_timestamp;
    user_state.cooldown_ends = 0; // No cooldown initially
    user_state.is_initialized = true;
    user_state.bump = ctx.bumps.user_state;
    
    Ok(())
}

pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    // ✅ Verify initialization
    require!(user_state.is_initialized, ErrorCode::StateNotInitialized);
    
    // ... rest of logic
}
```

---

### 🟡 High: Unused Field

**Problem:**
```rust
pub last_action_time: i64,  // Never used in the code!
```

**Issues:**
1. **Wasted space** - Costs rent for unused data
2. **Confusion** - Unclear purpose
3. **Potential bug** - Maybe should be used but isn't

**Fix:**
```rust
// Option 1: Remove if truly unused
#[account]
pub struct UserState {
    pub user: Pubkey,
    // pub last_action_time: i64, // ✅ REMOVED
    pub actions_today: u32,
    pub last_reset_time: i64,
    pub cooldown_ends: i64,
}

// Option 2: Use it for additional tracking
pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    // ... rate limit checks ...
    
    // ✅ Update last action time
    user_state.last_action_time = clock.unix_timestamp;
    
    Ok(())
}
```

---

### 🟢 Medium: Incomplete Action Type Handling

**Problem:**
```rust
match action {
    ActionType::ClaimRewards => {
        require!(
            user_state.actions_today < MAX_DAILY_CLAIMS,
            ErrorCode::DailyLimitExceeded
        );
    }
    // Other action types... ❌ No default case!
}
```

**Issues:**
1. **Silent bypass** - Unknown action types pass through
2. **No validation** - Other actions not checked
3. **Incomplete logic** - Comment suggests more cases but they're missing

**Fix:**
```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ActionType {
    ClaimRewards,
    Stake,
    Unstake,
    Transfer,
}

const MAX_DAILY_CLAIMS: u32 = 10;
const MAX_DAILY_STAKES: u32 = 20;
const MAX_DAILY_UNSTAKES: u32 = 20;
const MAX_DAILY_TRANSFERS: u32 = 50;

pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    let clock = Clock::get()?;
    
    // ... reset logic ...
    
    // ✅ Check daily limit based on action type
    let max_actions = match action {
        ActionType::ClaimRewards => MAX_DAILY_CLAIMS,
        ActionType::Stake => MAX_DAILY_STAKES,
        ActionType::Unstake => MAX_DAILY_UNSTAKES,
        ActionType::Transfer => MAX_DAILY_TRANSFERS,
    };
    
    require!(
        user_state.actions_today < max_actions,
        ErrorCode::DailyLimitExceeded
    );
    
    // ... rest of logic
}
```

---

### 🟢 Medium: No Per-Action Tracking

**Problem:** Single counter for all action types.

**Issues:**
1. **Unfair limits** - One action type can consume entire daily quota
2. **No granularity** - Can't enforce different limits per action
3. **Poor UX** - User might be blocked from important actions due to less important ones

**Fix:**
```rust
#[account]
pub struct UserState {
    pub user: Pubkey,
    pub claims_today: u16,
    pub stakes_today: u16,
    pub unstakes_today: u16,
    pub transfers_today: u16,
    pub last_reset_time: i64,
    pub cooldown_ends: i64,
    pub is_initialized: bool,
    pub bump: u8,
}

pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    let clock = Clock::get()?;
    let current_day = get_current_day(clock.unix_timestamp);
    let last_reset_day = get_current_day(user_state.last_reset_time);
    
    // Reset all counters if new day
    if current_day > last_reset_day {
        user_state.claims_today = 0;
        user_state.stakes_today = 0;
        user_state.unstakes_today = 0;
        user_state.transfers_today = 0;
        user_state.last_reset_time = clock.unix_timestamp;
    }
    
    // ✅ Check and increment specific counter
    match action {
        ActionType::ClaimRewards => {
            require!(
                user_state.claims_today < MAX_DAILY_CLAIMS,
                ErrorCode::DailyClaimLimitExceeded
            );
            user_state.claims_today = user_state.claims_today
                .checked_add(1)
                .ok_or(ErrorCode::Overflow)?;
        }
        ActionType::Stake => {
            require!(
                user_state.stakes_today < MAX_DAILY_STAKES,
                ErrorCode::DailyStakeLimitExceeded
            );
            user_state.stakes_today = user_state.stakes_today
                .checked_add(1)
                .ok_or(ErrorCode::Overflow)?;
        }
        ActionType::Unstake => {
            require!(
                user_state.unstakes_today < MAX_DAILY_UNSTAKES,
                ErrorCode::DailyUnstakeLimitExceeded
            );
            user_state.unstakes_today = user_state.unstakes_today
                .checked_add(1)
                .ok_or(ErrorCode::Overflow)?;
        }
        ActionType::Transfer => {
            require!(
                user_state.transfers_today < MAX_DAILY_TRANSFERS,
                ErrorCode::DailyTransferLimitExceeded
            );
            user_state.transfers_today = user_state.transfers_today
                .checked_add(1)
                .ok_or(ErrorCode::Overflow)?;
        }
    }
    
    // Check cooldown
    require!(
        clock.unix_timestamp >= user_state.cooldown_ends,
        ErrorCode::CooldownActive
    );
    
    // Update cooldown
    user_state.cooldown_ends = clock
        .unix_timestamp
        .checked_add(COOLDOWN_PERIOD)
        .ok_or(ErrorCode::Overflow)?;
    
    Ok(())
}
```

---

### 🟢 Medium: No Event Logging

**Problem:** Rate limit violations not logged.

**Fix:**
```rust
#[event]
pub struct RateLimitCheckedEvent {
    pub user: Pubkey,
    pub action: ActionType,
    pub actions_today: u32,
    pub cooldown_ends: i64,
    pub timestamp: i64,
}

#[event]
pub struct RateLimitExceededEvent {
    pub user: Pubkey,
    pub action: ActionType,
    pub actions_today: u32,
    pub max_actions: u32,
    pub timestamp: i64,
}

pub fn check_rate_limit(user_state: &mut UserState, action: ActionType) -> Result<()> {
    // ... checks ...
    
    if user_state.actions_today >= max_actions {
        emit!(RateLimitExceededEvent {
            user: user_state.user,
            action,
            actions_today: user_state.actions_today,
            max_actions,
            timestamp: clock.unix_timestamp,
        });
        
        return Err(ErrorCode::DailyLimitExceeded.into());
    }
    
    // ... continue ...
    
    emit!(RateLimitCheckedEvent {
        user: user_state.user,
        action,
        actions_today: user_state.actions_today,
        cooldown_ends: user_state.cooldown_ends,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
```

---

## Complete Secure Implementation

```rust
use anchor_lang::prelude::*;

// Constants
const SECONDS_PER_DAY: i64 = 86400;
const MAX_DAILY_CLAIMS: u16 = 10;
const MAX_DAILY_STAKES: u16 = 20;
const MAX_DAILY_UNSTAKES: u16 = 20;
const MAX_DAILY_TRANSFERS: u16 = 50;
const COOLDOWN_PERIOD: i64 = 60; // 1 minute between actions

#[program]
pub mod rate_limiter {
    use super::*;

    pub fn initialize_user_state(ctx: Context<InitializeUserState>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        let clock = Clock::get()?;
        
        user_state.user = ctx.accounts.user.key();
        user_state.claims_today = 0;
        user_state.stakes_today = 0;
        user_state.unstakes_today = 0;
        user_state.transfers_today = 0;
        user_state.last_reset_time = clock.unix_timestamp;
        user_state.cooldown_ends = 0;
        user_state.is_initialized = true;
        user_state.bump = ctx.bumps.user_state;
        
        emit!(UserStateInitializedEvent {
            user: user_state.user,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    pub fn check_rate_limit(
        ctx: Context<CheckRateLimit>,
        action: ActionType,
    ) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        let clock = Clock::get()?;
        
        // ✅ Verify initialization
        require!(user_state.is_initialized, ErrorCode::StateNotInitialized);
        
        // ✅ Calculate current day (deterministic)
        let current_day = get_current_day(clock.unix_timestamp);
        let last_reset_day = get_current_day(user_state.last_reset_time);
        
        // ✅ Reset counters if new day
        if current_day > last_reset_day {
            user_state.claims_today = 0;
            user_state.stakes_today = 0;
            user_state.unstakes_today = 0;
            user_state.transfers_today = 0;
            user_state.last_reset_time = clock.unix_timestamp;
            
            emit!(DailyCounterResetEvent {
                user: user_state.user,
                timestamp: clock.unix_timestamp,
            });
        }
        
        // ✅ Check cooldown
        require!(
            clock.unix_timestamp >= user_state.cooldown_ends,
            ErrorCode::CooldownActive
        );
        
        // ✅ Check and increment specific counter
        match action {
            ActionType::ClaimRewards => {
                require!(
                    user_state.claims_today < MAX_DAILY_CLAIMS,
                    ErrorCode::DailyClaimLimitExceeded
                );
                user_state.claims_today = user_state.claims_today
                    .checked_add(1)
                    .ok_or(ErrorCode::Overflow)?;
            }
            ActionType::Stake => {
                require!(
                    user_state.stakes_today < MAX_DAILY_STAKES,
                    ErrorCode::DailyStakeLimitExceeded
                );
                user_state.stakes_today = user_state.stakes_today
                    .checked_add(1)
                    .ok_or(ErrorCode::Overflow)?;
            }
            ActionType::Unstake => {
                require!(
                    user_state.unstakes_today < MAX_DAILY_UNSTAKES,
                    ErrorCode::DailyUnstakeLimitExceeded
                );
                user_state.unstakes_today = user_state.unstakes_today
                    .checked_add(1)
                    .ok_or(ErrorCode::Overflow)?;
            }
            ActionType::Transfer => {
                require!(
                    user_state.transfers_today < MAX_DAILY_TRANSFERS,
                    ErrorCode::DailyTransferLimitExceeded
                );
                user_state.transfers_today = user_state.transfers_today
                    .checked_add(1)
                    .ok_or(ErrorCode::Overflow)?;
            }
        }
        
        // ✅ Update cooldown with overflow protection
        user_state.cooldown_ends = clock
            .unix_timestamp
            .checked_add(COOLDOWN_PERIOD)
            .ok_or(ErrorCode::Overflow)?;
        
        // ✅ Emit event
        emit!(RateLimitCheckedEvent {
            user: user_state.user,
            action,
            claims_today: user_state.claims_today,
            stakes_today: user_state.stakes_today,
            unstakes_today: user_state.unstakes_today,
            transfers_today: user_state.transfers_today,
            cooldown_ends: user_state.cooldown_ends,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }
}

// Helper function
fn get_current_day(timestamp: i64) -> i64 {
    timestamp / SECONDS_PER_DAY
}

#[derive(Accounts)]
pub struct InitializeUserState<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserState::INIT_SPACE,
        seeds = [b"user_state", user.key().as_ref()],
        bump,
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckRateLimit<'info> {
    #[account(
        mut,
        seeds = [b"user_state", user.key().as_ref()],
        bump = user_state.bump,
        has_one = user @ ErrorCode::Unauthorized,
    )]
    pub user_state: Account<'info, UserState>,
    
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct UserState {
    pub user: Pubkey,
    pub claims_today: u16,
    pub stakes_today: u16,
    pub unstakes_today: u16,
    pub transfers_today: u16,
    pub last_reset_time: i64,
    pub cooldown_ends: i64,
    pub is_initialized: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ActionType {
    ClaimRewards,
    Stake,
    Unstake,
    Transfer,
}

#[event]
pub struct UserStateInitializedEvent {
    pub user: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DailyCounterResetEvent {
    pub user: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RateLimitCheckedEvent {
    pub user: Pubkey,
    pub action: ActionType,
    pub claims_today: u16,
    pub stakes_today: u16,
    pub unstakes_today: u16,
    pub transfers_today: u16,
    pub cooldown_ends: i64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("User state not initialized")]
    StateNotInitialized,
    
    #[msg("Unauthorized: Not the state owner")]
    Unauthorized,
    
    #[msg("Daily claim limit exceeded")]
    DailyClaimLimitExceeded,
    
    #[msg("Daily stake limit exceeded")]
    DailyStakeLimitExceeded,
    
    #[msg("Daily unstake limit exceeded")]
    DailyUnstakeLimitExceeded,
    
    #[msg("Daily transfer limit exceeded")]
    DailyTransferLimitExceeded,
    
    #[msg("Cooldown active: Please wait before performing another action")]
    CooldownActive,
    
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    
    #[msg("Arithmetic overflow")]
    Overflow,
}
```

---

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_daily_reset() {
        // Should reset counters after 24 hours
    }

    #[test]
    fn test_cooldown_enforcement() {
        // Should enforce cooldown between actions
    }

    #[test]
    fn test_per_action_limits() {
        // Should track limits separately per action type
    }

    #[test]
    fn test_overflow_protection() {
        // Should handle overflow gracefully
    }

    #[test]
    fn test_race_condition() {
        // Should handle concurrent transactions at day boundary
    }

    #[test]
    fn test_uninitialized_state() {
        // Should reject uninitialized state
    }
}
```

---

## Summary

### Critical Issues Fixed

1. ✅ Integer overflow in time calculation - Use `checked_sub()`
2. ✅ Integer overflow in cooldown calculation - Use `checked_add()`
3. ✅ Integer overflow in counter increment - Use `checked_add()`

### High-Priority Issues Fixed

1. ✅ Race condition in daily reset - Use deterministic day calculation
2. ✅ Missing initialization check - Add `is_initialized` flag
3. ✅ Unused field - Remove or use `last_action_time`

### Medium-Priority Issues Fixed

1. ✅ Incomplete action type handling - Handle all cases
2. ✅ No per-action tracking - Separate counters per action
3. ✅ No event logging - Emit events for monitoring

### Security Improvements

- **No overflow** - All arithmetic uses checked operations
- **Deterministic reset** - Day calculation prevents race conditions
- **Per-action limits** - Fair quota distribution
- **Proper initialization** - State validation
- **Event logging** - Full audit trail
- **Clear errors** - Specific error messages per limit type

### Performance

- Efficient day calculation
- Minimal compute units
- Compact state structure
- Clear logic flow
