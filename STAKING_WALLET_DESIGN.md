# Staking Wallet - Self-Custody Staking System

## Overview

A self-custody staking subdomain where users lock PANGI tokens while maintaining custody, earning rewards based on lock duration.

---

## Core Concept

### Staking Wallet (Subdomain)

**User Flow**:
```
1. Master NFT creates "Staking" subdomain
2. User deposits PANGI tokens into Staking wallet
3. User selects lock duration (30, 60, 90, 180, 365 days)
4. Staking wallet signals staking program
5. User earns daily rewards (distributed at end)
6. Longer lock = higher APY
7. Guardian reports unlock immediately to public address
8. Early unlock = proportional rewards - 15% penalty
   - Get rewards for time staked (e.g., 50% time = 50% rewards)
   - 15% penalty deducted from earned rewards
   - Penalty returns to reward pool
   - Net payout = (time_staked_percentage × total_rewards) × 0.85
```

**Key Principle**: **Self-Custody Mandatory Reporting**
- ✅ User maintains custody of tokens (self-custody)
- ✅ Tokens locked in user's wallet (not transferred)
- ✅ Staking program tracks lock status
- ✅ Rewards calculated by staking program
- ✅ Guardian reports OUT only (no inbound data from PANGI)
- ✅ Guardian sends reports to public address where rewards are sent
- ✅ Master installs accurate reporting configuration on staking program
- ✅ Guardian cannot receive information from PANGI (one-way reporting)
- ⚠️ **Early unlock penalty: Proportional rewards - 15%**
  - User gets rewards for time actually staked
  - 15% penalty deducted from earned rewards
  - Penalty returns to reward pool for future stakers
  - Example: 50% time staked = (50% × rewards) × 85% payout

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────┐
│         Master NFT #42                              │
│  • Creates Staking Subdomain                        │
│  • Installs Guardian reporting configuration        │
│  • Sets public address for reward reports           │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│         Staking Wallet (Subdomain)                  │
│  • Holds PANGI tokens (user custody)                │
│  • Tracks lock duration                             │
│  • Signals staking program                          │
└────────────────┬────────────────────────────────────┘
                 │ signals
┌────────────────▼────────────────────────────────────┐
│         Staking Program (pangi-staking)             │
│  • Receives lock signal                             │
│  • Tracks stake positions                           │
│  • Calculates daily rewards                         │
│  • Distributes at unlock                            │
│  • Master-configured reporting rules                │
└────────────────┬────────────────────────────────────┘
                 │ monitored by
┌────────────────▼────────────────────────────────────┐
│         Guardian NFT (Monitor)                      │
│  • Monitors staking wallet (read-only)              │
│  • Reports OUT to public address                    │
│  • NO inbound data from PANGI                       │
│  • Reports unlock events to reward address          │
│  • One-way reporting only                           │
└─────────────────────────────────────────────────────┘
                 │ reports to
┌────────────────▼────────────────────────────────────┐
│         Public Reward Address                       │
│  • Receives Guardian reports                        │
│  • Processes reward distribution                    │
│  • Public address (no private data)                 │
└─────────────────────────────────────────────────────┘
```

---

## Smart Contract Design

### Staking Program Structure

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("StakeProgramID...");

#[program]
pub mod pangi_staking {
    use super::*;

    // User locks PANGI tokens
    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
        lock_duration_days: u16,
    ) -> Result<()> {
        // Validate lock duration
        require!(
            VALID_LOCK_DURATIONS.contains(&lock_duration_days),
            ErrorCode::InvalidLockDuration
        );

        let clock = Clock::get()?;

        // Create stake position
        let stake_position = &mut ctx.accounts.stake_position;
        stake_position.user = ctx.accounts.user.key();
        stake_position.staking_wallet = ctx.accounts.staking_wallet.key();
        stake_position.amount = amount;
        stake_position.lock_duration_days = lock_duration_days;
        stake_position.start_timestamp = clock.unix_timestamp;
        stake_position.end_timestamp = stake_position.start_timestamp + 
            (lock_duration_days as i64 * 86400);
        stake_position.apy_rate = get_apy_for_duration(lock_duration_days)?;
        stake_position.is_locked = true;
        stake_position.guardian_monitor = ctx.accounts.guardian_nft.key();

        // Update global statistics
        let stats = &mut ctx.accounts.staking_stats;
        update_time_periods(stats, clock.unix_timestamp)?;
        
        stats.total_staked = stats.total_staked
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;
        stats.total_stakers = stats.total_stakers
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.total_stakes_created = stats.total_stakes_created
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.stakes_today = stats.stakes_today
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.stakes_this_week = stats.stakes_this_week
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.stakes_this_month = stats.stakes_this_month
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.last_updated = clock.unix_timestamp;

        // Update unlock schedule
        update_unlock_schedule(
            &mut ctx.accounts.unlock_schedule,
            stake_position.end_timestamp,
            amount,
            true, // adding
        )?;

        // Tokens stay in user's staking wallet (self-custody)
        // Just mark as locked
        
        emit!(StakeCreated {
            user: stake_position.user,
            amount,
            lock_duration_days,
            apy_rate: stake_position.apy_rate,
            end_timestamp: stake_position.end_timestamp,
        });

        Ok(())
    }

    // Guardian reports unlock (ONE-WAY REPORTING)
    // Guardian sends report OUT to public reward address
    // Guardian receives NO data from PANGI (self-custody mandatory reporting)
    pub fn report_unlock(
        ctx: Context<ReportUnlock>,
    ) -> Result<()> {
        let stake_position = &mut ctx.accounts.stake_position;
        let clock = Clock::get()?;

        // Verify Guardian authority (configured by Master)
        require!(
            ctx.accounts.guardian_nft.key() == stake_position.guardian_monitor,
            ErrorCode::UnauthorizedGuardian
        );

        // Check if lock period ended
        require!(
            clock.unix_timestamp >= stake_position.end_timestamp,
            ErrorCode::LockPeriodNotEnded
        );

        // Calculate rewards
        let days_staked = stake_position.lock_duration_days as u64;
        let daily_reward = calculate_daily_reward(
            stake_position.amount,
            stake_position.apy_rate
        )?;
        let total_reward = daily_reward
            .checked_mul(days_staked)
            .ok_or(ErrorCode::Overflow)?;

        // Mark as unlocked
        stake_position.is_locked = false;
        stake_position.unlock_timestamp = Some(clock.unix_timestamp);
        stake_position.total_reward = total_reward;

        // Update global statistics
        let stats = &mut ctx.accounts.staking_stats;
        update_time_periods(stats, clock.unix_timestamp)?;
        
        stats.total_staked = stats.total_staked
            .checked_sub(stake_position.amount)
            .ok_or(ErrorCode::Underflow)?;
        stats.total_stakers = stats.total_stakers
            .checked_sub(1)
            .ok_or(ErrorCode::Underflow)?;
        stats.total_stakes_completed = stats.total_stakes_completed
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.unlocks_today = stats.unlocks_today
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.unlocks_this_week = stats.unlocks_this_week
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.unlocks_this_month = stats.unlocks_this_month
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        stats.last_updated = clock.unix_timestamp;

        // Update unlock schedule (remove from schedule)
        update_unlock_schedule(
            &mut ctx.accounts.unlock_schedule,
            stake_position.end_timestamp,
            stake_position.amount,
            false, // removing
        )?;

        // ONE-WAY REPORTING: Guardian reports OUT to public reward address
        // Guardian does NOT receive any data from PANGI
        // Public address configured by Master during setup
        emit!(UnlockReported {
            user: stake_position.user,
            amount: stake_position.amount,
            total_reward,
            days_staked,
            reward_address: stake_position.reward_address, // Public address for rewards
        });

        Ok(())
    }

    // User claims rewards
    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
    ) -> Result<()> {
        let stake_position = &mut ctx.accounts.stake_position;
        let clock = Clock::get()?;

        // Verify user
        require!(
            ctx.accounts.user.key() == stake_position.user,
            ErrorCode::Unauthorized
        );

        // Verify unlocked
        require!(
            !stake_position.is_locked,
            ErrorCode::StillLocked
        );

        // Verify not already claimed
        require!(
            !stake_position.rewards_claimed,
            ErrorCode::AlreadyClaimed
        );

        // Transfer rewards from reward pool
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.reward_pool.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.reward_pool_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, stake_position.total_reward)?;

        // Update global statistics
        let stats = &mut ctx.accounts.staking_stats;
        stats.total_rewards_paid = stats.total_rewards_paid
            .checked_add(stake_position.total_reward)
            .ok_or(ErrorCode::Overflow)?;
        stats.last_updated = clock.unix_timestamp;

        // Mark as claimed
        stake_position.rewards_claimed = true;
        stake_position.claim_timestamp = Some(clock.unix_timestamp);

        emit!(RewardsClaimed {
            user: stake_position.user,
            amount: stake_position.total_reward,
        });

        Ok(())
    }

    // Get current statistics (view function)
    pub fn get_statistics(
        ctx: Context<GetStatistics>,
    ) -> Result<StakingStatsView> {
        let stats = &ctx.accounts.staking_stats;
        let clock = Clock::get()?;
        
        // Ensure time periods are current
        let mut updated_stats = stats.clone();
        update_time_periods(&mut updated_stats, clock.unix_timestamp)?;
        
        Ok(StakingStatsView {
            total_staked: updated_stats.total_staked,
            total_stakers: updated_stats.total_stakers,
            total_rewards_paid: updated_stats.total_rewards_paid,
            total_stakes_created: updated_stats.total_stakes_created,
            total_stakes_completed: updated_stats.total_stakes_completed,
            stakes_today: updated_stats.stakes_today,
            stakes_this_week: updated_stats.stakes_this_week,
            stakes_this_month: updated_stats.stakes_this_month,
            unlocks_today: updated_stats.unlocks_today,
            unlocks_this_week: updated_stats.unlocks_this_week,
            unlocks_this_month: updated_stats.unlocks_this_month,
        })
    }

    // Get unlock schedule (view function)
    pub fn get_unlock_schedule(
        ctx: Context<GetUnlockSchedule>,
    ) -> Result<UnlockScheduleView> {
        let schedule = &ctx.accounts.unlock_schedule;
        let clock = Clock::get()?;
        
        // Recalculate if stale (older than 1 hour)
        if clock.unix_timestamp - schedule.last_calculated > 3600 {
            recalculate_unlock_schedule(
                &mut ctx.accounts.unlock_schedule,
                clock.unix_timestamp,
            )?;
        }
        
        Ok(UnlockScheduleView {
            next_hour_unlocks: schedule.next_hour_unlocks,
            next_day_unlocks: schedule.next_day_unlocks,
            next_week_unlocks: schedule.next_week_unlocks,
            next_month_unlocks: schedule.next_month_unlocks,
            next_hour_amount: schedule.next_hour_amount,
            next_day_amount: schedule.next_day_amount,
            next_week_amount: schedule.next_week_amount,
            next_month_amount: schedule.next_month_amount,
        })
    }
}

// Accounts
#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + StakePosition::INIT_SPACE
    )]
    pub stake_position: Account<'info, StakePosition>,
    
    /// Staking wallet (subdomain)
    pub staking_wallet: Account<'info, TokenAccount>,
    
    /// Guardian NFT that will monitor
    pub guardian_nft: Account<'info, GuardianNFT>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReportUnlock<'info> {
    #[account(mut)]
    pub guardian_nft: Signer<'info>,
    
    #[account(mut)]
    pub stake_position: Account<'info, StakePosition>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub stake_position: Account<'info, StakePosition>,
    
    #[account(mut)]
    pub reward_pool: Account<'info, TokenAccount>,
    
    /// CHECK: Reward pool authority PDA
    pub reward_pool_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

// Data structures
#[account]
#[derive(InitSpace)]
pub struct StakePosition {
    pub user: Pubkey,
    pub staking_wallet: Pubkey,
    pub amount: u64,
    pub lock_duration_days: u16,
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub unlock_timestamp: Option<i64>,
    pub apy_rate: u16,              // Basis points (e.g., 1000 = 10%)
    pub is_locked: bool,
    pub total_reward: u64,
    pub rewards_claimed: bool,
    pub claim_timestamp: Option<i64>,
    pub guardian_monitor: Pubkey,   // Guardian that reports OUT
    pub reward_address: Pubkey,     // Public address where Guardian sends reports
                                     // Master configures this during stake creation
}

// Global staking statistics
#[account]
#[derive(InitSpace)]
pub struct StakingStats {
    pub total_staked: u64,              // Total PANGI currently staked
    pub total_stakers: u64,             // Total number of active stakers
    pub total_rewards_paid: u64,        // Lifetime rewards distributed
    pub total_stakes_created: u64,      // Lifetime stakes created
    pub total_stakes_completed: u64,    // Lifetime stakes completed (full duration)
    pub total_early_unlocks: u64,       // Lifetime early unlocks (before duration ended)
    pub total_rewards_forfeited: u64,   // Total rewards forfeited due to early unlock
    
    // Time-based tracking
    pub stakes_today: u64,              // Stakes created today
    pub stakes_this_week: u64,          // Stakes created this week
    pub stakes_this_month: u64,         // Stakes created this month
    
    pub unlocks_today: u64,             // Unlocks today
    pub unlocks_this_week: u64,         // Unlocks this week
    pub unlocks_this_month: u64,        // Unlocks this month
    
    pub early_unlocks_today: u64,       // Early unlocks today
    pub early_unlocks_this_week: u64,   // Early unlocks this week
    pub early_unlocks_this_month: u64,  // Early unlocks this month
    
    // Tracking periods
    pub current_day: i64,               // Current day timestamp
    pub current_week: i64,              // Current week timestamp
    pub current_month: i64,             // Current month timestamp
    
    // Last update
    pub last_updated: i64,
}

// Unlock schedule tracking
#[account]
#[derive(InitSpace)]
pub struct UnlockSchedule {
    pub next_hour_unlocks: u64,         // Expected unlocks in next hour
    pub next_day_unlocks: u64,          // Expected unlocks in next 24h
    pub next_week_unlocks: u64,         // Expected unlocks in next 7 days
    pub next_month_unlocks: u64,        // Expected unlocks in next 30 days
    
    pub next_hour_amount: u64,          // PANGI unlocking in next hour
    pub next_day_amount: u64,           // PANGI unlocking in next 24h
    pub next_week_amount: u64,          // PANGI unlocking in next 7 days
    pub next_month_amount: u64,         // PANGI unlocking in next 30 days
    
    pub last_calculated: i64,           // Last calculation timestamp
}

// Constants
const VALID_LOCK_DURATIONS: &[u16] = &[30, 60, 90, 180, 365];

// APY tiers (basis points)
const APY_30_DAYS: u16 = 500;    // 5%
const APY_60_DAYS: u16 = 800;    // 8%
const APY_90_DAYS: u16 = 1200;   // 12%
const APY_180_DAYS: u16 = 1800;  // 18%
const APY_365_DAYS: u16 = 2500;  // 25%

// Early unlock penalty
const EARLY_UNLOCK_PENALTY_BPS: u16 = 1500;  // 15% penalty (basis points)

// Early unlock reward calculation:
// 1. Calculate proportional rewards based on time staked
//    proportional_rewards = (time_staked / lock_duration) × total_potential_rewards
// 2. Apply 15% penalty
//    penalty_amount = proportional_rewards × 0.15
//    user_payout = proportional_rewards × 0.85
// 3. Return penalty to reward pool
//    reward_pool += penalty_amount

// Helper functions
fn get_apy_for_duration(days: u16) -> Result<u16> {
    match days {
        30 => Ok(APY_30_DAYS),
        60 => Ok(APY_60_DAYS),
        90 => Ok(APY_90_DAYS),
        180 => Ok(APY_180_DAYS),
        365 => Ok(APY_365_DAYS),
        _ => Err(ErrorCode::InvalidLockDuration.into()),
    }
}

fn calculate_daily_reward(amount: u64, apy_rate: u16) -> Result<u64> {
    // Daily reward = (amount * APY) / 365
    let annual_reward = amount
        .checked_mul(apy_rate as u64)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(10000) // Convert basis points
        .ok_or(ErrorCode::DivisionByZero)?;
    
    let daily_reward = annual_reward
        .checked_div(365)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    Ok(daily_reward)
}

// Calculate early unlock rewards with 15% penalty
fn calculate_early_unlock_rewards(
    amount: u64,
    apy_rate: u16,
    time_staked_seconds: i64,
    lock_duration_seconds: i64,
) -> Result<(u64, u64)> {
    // Calculate total potential rewards for full duration
    let daily_reward = calculate_daily_reward(amount, apy_rate)?;
    let lock_duration_days = lock_duration_seconds
        .checked_div(86400)
        .ok_or(ErrorCode::DivisionByZero)?;
    let total_potential_rewards = daily_reward
        .checked_mul(lock_duration_days as u64)
        .ok_or(ErrorCode::Overflow)?;
    
    // Calculate proportional rewards based on time actually staked
    let time_staked_days = time_staked_seconds
        .checked_div(86400)
        .ok_or(ErrorCode::DivisionByZero)?;
    let proportional_rewards = total_potential_rewards
        .checked_mul(time_staked_days as u64)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(lock_duration_days as u64)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    // Apply 15% penalty
    let penalty_amount = proportional_rewards
        .checked_mul(EARLY_UNLOCK_PENALTY_BPS as u64)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    let user_payout = proportional_rewards
        .checked_sub(penalty_amount)
        .ok_or(ErrorCode::Underflow)?;
    
    // Return (user_payout, penalty_amount)
    // penalty_amount goes back to reward pool
    Ok((user_payout, penalty_amount))
}

// Update time periods (reset counters when period changes)
fn update_time_periods(stats: &mut StakingStats, current_timestamp: i64) -> Result<()> {
    const DAY_SECONDS: i64 = 86400;
    const WEEK_SECONDS: i64 = 604800;
    const MONTH_SECONDS: i64 = 2592000; // 30 days
    
    let current_day = current_timestamp / DAY_SECONDS;
    let current_week = current_timestamp / WEEK_SECONDS;
    let current_month = current_timestamp / MONTH_SECONDS;
    
    // Reset daily counter if new day
    if current_day > stats.current_day {
        stats.stakes_today = 0;
        stats.unlocks_today = 0;
        stats.current_day = current_day;
    }
    
    // Reset weekly counter if new week
    if current_week > stats.current_week {
        stats.stakes_this_week = 0;
        stats.unlocks_this_week = 0;
        stats.current_week = current_week;
    }
    
    // Reset monthly counter if new month
    if current_month > stats.current_month {
        stats.stakes_this_month = 0;
        stats.unlocks_this_month = 0;
        stats.current_month = current_month;
    }
    
    Ok(())
}

// Update unlock schedule
fn update_unlock_schedule(
    schedule: &mut UnlockSchedule,
    end_timestamp: i64,
    amount: u64,
    adding: bool, // true = adding stake, false = removing
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let time_until_unlock = end_timestamp - now;
    
    const HOUR_SECONDS: i64 = 3600;
    const DAY_SECONDS: i64 = 86400;
    const WEEK_SECONDS: i64 = 604800;
    const MONTH_SECONDS: i64 = 2592000;
    
    if adding {
        // Adding new stake to schedule
        if time_until_unlock <= HOUR_SECONDS {
            schedule.next_hour_unlocks = schedule.next_hour_unlocks.checked_add(1).ok_or(ErrorCode::Overflow)?;
            schedule.next_hour_amount = schedule.next_hour_amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        }
        if time_until_unlock <= DAY_SECONDS {
            schedule.next_day_unlocks = schedule.next_day_unlocks.checked_add(1).ok_or(ErrorCode::Overflow)?;
            schedule.next_day_amount = schedule.next_day_amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        }
        if time_until_unlock <= WEEK_SECONDS {
            schedule.next_week_unlocks = schedule.next_week_unlocks.checked_add(1).ok_or(ErrorCode::Overflow)?;
            schedule.next_week_amount = schedule.next_week_amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        }
        if time_until_unlock <= MONTH_SECONDS {
            schedule.next_month_unlocks = schedule.next_month_unlocks.checked_add(1).ok_or(ErrorCode::Overflow)?;
            schedule.next_month_amount = schedule.next_month_amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        }
    } else {
        // Removing completed stake from schedule
        if time_until_unlock <= HOUR_SECONDS {
            schedule.next_hour_unlocks = schedule.next_hour_unlocks.checked_sub(1).ok_or(ErrorCode::Underflow)?;
            schedule.next_hour_amount = schedule.next_hour_amount.checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        }
        if time_until_unlock <= DAY_SECONDS {
            schedule.next_day_unlocks = schedule.next_day_unlocks.checked_sub(1).ok_or(ErrorCode::Underflow)?;
            schedule.next_day_amount = schedule.next_day_amount.checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        }
        if time_until_unlock <= WEEK_SECONDS {
            schedule.next_week_unlocks = schedule.next_week_unlocks.checked_sub(1).ok_or(ErrorCode::Underflow)?;
            schedule.next_week_amount = schedule.next_week_amount.checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        }
        if time_until_unlock <= MONTH_SECONDS {
            schedule.next_month_unlocks = schedule.next_month_unlocks.checked_sub(1).ok_or(ErrorCode::Underflow)?;
            schedule.next_month_amount = schedule.next_month_amount.checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        }
    }
    
    schedule.last_calculated = now;
    Ok(())
}

// Recalculate entire unlock schedule (expensive, only when stale)
fn recalculate_unlock_schedule(
    schedule: &mut UnlockSchedule,
    current_timestamp: i64,
) -> Result<()> {
    // This would iterate through all active stakes
    // and recalculate the schedule from scratch
    // Implementation depends on how stakes are stored/indexed
    
    schedule.last_calculated = current_timestamp;
    Ok(())
}

// View structs (for returning data)
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakingStatsView {
    pub total_staked: u64,
    pub total_stakers: u64,
    pub total_rewards_paid: u64,
    pub total_stakes_created: u64,
    pub total_stakes_completed: u64,
    pub total_early_unlocks: u64,        // Stakes unlocked before duration ended
    pub total_rewards_forfeited: u64,    // Rewards lost due to early unlock
    pub stakes_today: u64,
    pub stakes_this_week: u64,
    pub stakes_this_month: u64,
    pub unlocks_today: u64,
    pub unlocks_this_week: u64,
    pub unlocks_this_month: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UnlockScheduleView {
    pub next_hour_unlocks: u64,
    pub next_day_unlocks: u64,
    pub next_week_unlocks: u64,
    pub next_month_unlocks: u64,
    pub next_hour_amount: u64,
    pub next_day_amount: u64,
    pub next_week_amount: u64,
    pub next_month_amount: u64,
}

// Events
#[event]
pub struct StakeCreated {
    pub user: Pubkey,
    pub amount: u64,
    pub lock_duration_days: u16,
    pub apy_rate: u16,
    pub end_timestamp: i64,
}

#[event]
pub struct UnlockReported {
    pub user: Pubkey,
    pub amount: u64,
    pub total_reward: u64,
    pub days_staked: u64,
}

#[event]
pub struct RewardsClaimed {
    pub user: Pubkey,
    pub amount: u64,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid lock duration")]
    InvalidLockDuration,
    #[msg("Unauthorized guardian")]
    UnauthorizedGuardian,
    #[msg("Lock period has not ended")]
    LockPeriodNotEnded,
    #[msg("Still locked")]
    StillLocked,
    #[msg("Rewards already claimed")]
    AlreadyClaimed,
    #[msg("Overflow")]
    Overflow,
    #[msg("Division by zero")]
    DivisionByZero,
    #[msg("Unauthorized")]
    Unauthorized,
}
```

---

## User Flow

### 1. Create Staking Wallet

```typescript
// User creates Staking subdomain
const masterNFT = await getMasterNFT(userWallet);

await walletProgram.methods
  .addCustomSubdomain("staking")
  .accounts({
    masterNft: masterNFT,
    walletSystem: walletSystemPDA,
    user: userWallet.publicKey,
  })
  .rpc();
```

### 2. Deposit and Lock PANGI

```typescript
// User deposits PANGI into staking wallet
const stakingWallet = await getStakingWallet(masterNFT);
const amount = 10000 * 10**9; // 10,000 PANGI
const lockDuration = 90; // 90 days

// Transfer PANGI to staking wallet (user still owns it)
await token.transfer(
  connection,
  userWallet,
  userTokenAccount,
  stakingWallet,
  userWallet.publicKey,
  amount
);

// Create stake position
await stakingProgram.methods
  .stakeTokens(new BN(amount), lockDuration)
  .accounts({
    user: userWallet.publicKey,
    stakePosition: stakePositionPDA,
    stakingWallet: stakingWallet,
    guardianNft: guardianNFT,
  })
  .rpc();

// Result: Tokens locked for 90 days, earning 12% APY
```

### 3. Guardian Monitors

```typescript
// Guardian automatically monitors lock period
setInterval(async () => {
  const stakePositions = await getActiveStakePositions();
  
  for (const position of stakePositions) {
    const now = Date.now() / 1000;
    
    if (now >= position.endTimestamp && position.isLocked) {
      // Lock period ended, report unlock
      await stakingProgram.methods
        .reportUnlock()
        .accounts({
          guardianNft: guardianWallet.publicKey,
          stakePosition: position.publicKey,
        })
        .rpc();
      
      console.log(`Unlock reported for ${position.user}`);
    }
  }
}, 60000); // Check every minute
```

### 4. Early Unlock (Optional)

```typescript
// User can unlock early but pays 15% penalty on proportional rewards
const stakePosition = await getStakePosition(userWallet);
const now = Date.now() / 1000;

if (now < stakePosition.unlockAt) {
  // Calculate early unlock details
  const timeStaked = now - stakePosition.stakedAt;
  const lockDuration = stakePosition.unlockAt - stakePosition.stakedAt;
  const timePercentage = timeStaked / lockDuration;
  
  const totalPotentialRewards = calculateTotalRewards(stakePosition);
  const proportionalRewards = totalPotentialRewards * timePercentage;
  const penalty = proportionalRewards * 0.15;
  const userPayout = proportionalRewards * 0.85;
  
  console.log("⚠️ WARNING: Early unlock incurs 15% penalty!");
  console.log(`Time staked: ${timePercentage * 100}% of duration`);
  console.log(`Proportional rewards: ${proportionalRewards} PANGI`);
  console.log(`Penalty (15%): ${penalty} PANGI (returns to pool)`);
  console.log(`Your payout: ${userPayout} PANGI`);
  console.log(`Days remaining: ${(stakePosition.unlockAt - now) / 86400}`);
  
  // User confirms early unlock
  await stakingProgram.methods
    .withdrawTokens(stakePosition.amount)
    .accounts({
      vault: vaultPDA,
      stakeRecord: stakePositionPDA,
      authority: userWallet.publicKey,
      userTokenAccount: userTokenAccount,
      vaultTokenAccount: vaultTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  
  // Result: 
  // - User gets principal back: 10,000 PANGI
  // - User gets proportional rewards - 15%: userPayout PANGI
  // - Penalty returns to pool: penalty PANGI
  // EarlyUnlockEvent emitted with penalty amount
}
```

### 5. User Claims Rewards (After Full Duration)

```typescript
// After unlock_at reached, user claims full rewards
const stakePosition = await getStakePosition(userWallet);
const now = Date.now() / 1000;

if (now >= stakePosition.unlockAt && !stakePosition.rewardsClaimed) {
  await stakingProgram.methods
    .claimRewards()
    .accounts({
      user: userWallet.publicKey,
      stakePosition: stakePositionPDA,
      rewardPool: rewardPoolAccount,
      rewardPoolAuthority: rewardPoolAuthorityPDA,
      userTokenAccount: userTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  
  console.log(`Claimed ${stakePosition.totalReward} PANGI rewards`);
}
```

---

## APY Tiers

### Lock Duration vs APY

| Lock Duration | APY | Daily Rate | Example (10,000 PANGI) | Early Unlock (50% time) |
|---------------|-----|------------|------------------------|-------------------------|
| 30 days | 5% | 0.0137% | 500 PANGI total | 212.5 PANGI (85% of 250) |
| 60 days | 8% | 0.0219% | 800 PANGI total | 340 PANGI (85% of 400) |
| 90 days | 12% | 0.0329% | 1,200 PANGI total | 510 PANGI (85% of 600) |
| 180 days | 18% | 0.0493% | 1,800 PANGI total | 765 PANGI (85% of 900) |
| 365 days | 25% | 0.0685% | 2,500 PANGI total | 1,062.5 PANGI (85% of 1,250) |

**Calculation**:
```
Daily Reward = (Amount × APY) / 365
Total Reward = Daily Reward × Lock Duration Days

Example (10,000 PANGI, 90 days, 12% APY):
Daily Reward = (10,000 × 0.12) / 365 = 3.29 PANGI/day
Total Potential Reward = 3.29 × 90 = 296 PANGI

Full Duration (90 days):
Principal Returned = 10,000 PANGI ✅
Rewards = 296 PANGI ✅ (no penalty)

Early Unlock (45 days - 50% through):
Time Percentage = 45 / 90 = 50%
Proportional Rewards = 296 × 0.50 = 148 PANGI
Penalty (15%) = 148 × 0.15 = 22.2 PANGI
User Payout = 148 × 0.85 = 125.8 PANGI ✅
To Pool = 22.2 PANGI (redistributed)
Principal Returned = 10,000 PANGI ✅
```

### Early Unlock Policy

**⚠️ IMPORTANT: Early unlock penalty is proportional rewards - 15%**

- User can withdraw principal anytime
- If withdrawn before `unlock_at`: **proportional rewards - 15% penalty**
- If withdrawn after `unlock_at`: **full rewards** earned (no penalty)
- Proportional rewards based on time actually staked
- 15% penalty returns to reward pool for future stakers

**Reward Formula**:
```
time_percentage = time_staked / lock_duration
proportional_rewards = time_percentage × total_potential_rewards
penalty = proportional_rewards × 0.15
user_payout = proportional_rewards × 0.85
reward_pool += penalty
```

**Example Scenarios**:

```
Scenario 1: Full Duration (90 days)
- Stake: 10,000 PANGI
- Lock: 90 days at 12% APY
- Wait: Full 90 days
- Total Potential Rewards: 1,200 PANGI
- Time Percentage: 100%
- Proportional Rewards: 1,200 PANGI
- Penalty: 0 PANGI (no penalty for full duration)
- User Payout: 1,200 PANGI ✅
- To Pool: 0 PANGI

Scenario 2: Early Unlock (45 days - 50% through)
- Stake: 10,000 PANGI
- Lock: 90 days at 12% APY
- Wait: 45 days (50% of duration)
- Total Potential Rewards: 1,200 PANGI
- Time Percentage: 50%
- Proportional Rewards: 600 PANGI
- Penalty: 90 PANGI (15% of 600)
- User Payout: 510 PANGI ✅
- To Pool: 90 PANGI (redistributed to future stakers)

Scenario 3: Early Unlock (89 days - 98.9% through)
- Stake: 10,000 PANGI
- Lock: 90 days at 12% APY
- Wait: 89 days (98.9% of duration)
- Total Potential Rewards: 1,200 PANGI
- Time Percentage: 98.9%
- Proportional Rewards: 1,187 PANGI
- Penalty: 178 PANGI (15% of 1,187)
- User Payout: 1,009 PANGI ✅
- To Pool: 178 PANGI

Scenario 4: Very Early Unlock (7 days - 7.8% through)
- Stake: 10,000 PANGI
- Lock: 90 days at 12% APY
- Wait: 7 days (7.8% of duration)
- Total Potential Rewards: 1,200 PANGI
- Time Percentage: 7.8%
- Proportional Rewards: 93 PANGI
- Penalty: 14 PANGI (15% of 93)
- User Payout: 79 PANGI ✅
- To Pool: 14 PANGI
```

**Key Benefits**:
- ✅ Fair: Users get rewards for time actually staked
- ✅ Penalty discourages early unlock but isn't punitive
- ✅ Penalty returns to pool, benefiting all stakers
- ✅ Encourages commitment while allowing flexibility
- ✅ Pool grows from penalties, increasing sustainability

---

## Self-Custody Mechanism

### How Tokens Stay in User Custody

**Traditional Staking** (Custodial):
```
User → Transfer tokens to staking contract
Contract holds tokens ❌
User loses custody ❌
```

**PANGI Staking** (Self-Custody):
```
User → Transfer tokens to own staking wallet
Staking wallet = user's subdomain ✅
User maintains custody ✅
Staking program just tracks lock status ✅
```

### Technical Implementation

```rust
// Tokens stay in user's staking wallet
pub struct StakePosition {
    pub staking_wallet: Pubkey,  // User's wallet, not program's
    pub is_locked: bool,         // Just a flag
    // ... other fields
}

// Staking program doesn't hold tokens
// It just tracks who locked what and when
```

---

## Guardian Role

### Guardian Responsibilities

**Monitor**:
- Check stake positions periodically
- Detect when lock period ends
- Report unlock immediately

**Report Unlock**:
```rust
pub fn report_unlock(ctx: Context<ReportUnlock>) -> Result<()> {
    // Guardian calls this when lock period ends
    // Triggers reward calculation
    // Allows user to claim
}
```

**Why Guardian?**:
- Automates unlock detection
- User doesn't need to manually check
- Ensures timely reward distribution
- Guardian earns small fee (optional)

### Guardian Permissions

```typescript
// Guardian created with staking monitoring permission
const guardianPermissions = [
  {
    type: "MonitorStaking",
    stakingWallet: stakingWalletPDA,
    canReportUnlock: true,
  }
];

await masterGuardianProgram.methods
  .createGuardian(guardianNFT, guardianPermissions)
  .rpc();
```

---

## PANGI.sol Governance

### What PANGI.sol Controls

**APY Rates**:
```rust
// PANGI.sol can update APY rates
pub fn update_apy_rates(
    ctx: Context<UpdateAPYRates>,
    new_rates: [u16; 5], // [30d, 60d, 90d, 180d, 365d]
) -> Result<()> {
    // Only PANGI.sol authority
    require!(
        ctx.accounts.authority.key() == PANGI_SOL_AUTHORITY,
        ErrorCode::Unauthorized
    );
    
    // Update rates
    let config = &mut ctx.accounts.staking_config;
    config.apy_30_days = new_rates[0];
    config.apy_60_days = new_rates[1];
    config.apy_90_days = new_rates[2];
    config.apy_180_days = new_rates[3];
    config.apy_365_days = new_rates[4];
    
    Ok(())
}
```

**Lock Durations**:
- Can add new lock duration tiers
- Can adjust existing tiers
- Cannot change active stakes (retroactive protection)

**Reward Pool**:
- Controls reward pool funding
- Sets reward distribution rules
- Cannot access user staked tokens

---

## Security Considerations

### User Security

**Self-Custody**:
- ✅ Tokens in user's staking wallet
- ✅ User controls Master NFT
- ✅ User can emergency withdraw (with penalty)

**Lock Enforcement**:
- ✅ Smart contract enforces lock
- ✅ Cannot transfer while locked
- ✅ Guardian reports unlock automatically

### PANGI Security

**No Custody**:
- ✅ PANGI doesn't hold user tokens
- ✅ PANGI doesn't control staking wallets
- ✅ PANGI only governs APY rates

**Reward Pool**:
- ✅ Separate reward pool account
- ✅ Controlled by PANGI.sol
- ✅ Only distributes earned rewards

---

## Summary

**Staking Wallet System**:
1. User creates Staking subdomain (Master NFT)
2. User deposits PANGI into staking wallet (self-custody)
3. User selects lock duration (30-365 days)
4. Staking program tracks lock status
5. Guardian monitors and reports unlock
6. User claims rewards at end
7. Longer lock = higher APY (5%-25%)

**Key Features**:
- ✅ Self-custody (user keeps tokens)
- ✅ Automatic monitoring (Guardian)
- ✅ Flexible durations (30-365 days)
- ✅ Tiered APY (5%-25%)
- ✅ Daily reward calculation
- ✅ Distributed at unlock
- ✅ PANGI.sol governance

**This maintains self-custody while enabling staking rewards!**

---

## Analytics & Tracking System

### Global Statistics Tracked

#### Real-Time Metrics

**Total Staked**:
```
Current PANGI locked in staking
Example: 5,000,000 PANGI currently staked
```

**Total Stakers**:
```
Number of active stake positions
Example: 1,234 users currently staking
```

**Total Rewards Paid**:
```
Lifetime rewards distributed
Example: 250,000 PANGI paid in rewards
```

#### Historical Metrics

**Total Stakes Created**:
```
Lifetime number of stakes
Example: 5,678 stakes created since launch
```

**Total Stakes Completed**:
```
Lifetime number of completed stakes
Example: 4,444 stakes completed
```

### Time-Based Tracking

#### Daily Metrics

**Stakes Today**:
```
New stakes created today
Resets at midnight UTC
Example: 45 stakes today
```

**Unlocks Today**:
```
Stakes unlocked today
Resets at midnight UTC
Example: 32 unlocks today
```

#### Weekly Metrics

**Stakes This Week**:
```
New stakes created this week (7 days)
Resets every Monday
Example: 234 stakes this week
```

**Unlocks This Week**:
```
Stakes unlocked this week
Resets every Monday
Example: 189 unlocks this week
```

#### Monthly Metrics

**Stakes This Month**:
```
New stakes created this month (30 days)
Resets on 1st of month
Example: 987 stakes this month
```

**Unlocks This Month**:
```
Stakes unlocked this month
Resets on 1st of month
Example: 876 unlocks this month
```

### Unlock Schedule Forecasting

#### Next Hour

**Expected Unlocks**:
```
Number of stakes unlocking in next 60 minutes
Example: 3 unlocks expected in next hour
```

**Amount Unlocking**:
```
Total PANGI unlocking in next hour
Example: 45,000 PANGI unlocking in next hour
```

#### Next Day (24 Hours)

**Expected Unlocks**:
```
Number of stakes unlocking in next 24 hours
Example: 67 unlocks expected tomorrow
```

**Amount Unlocking**:
```
Total PANGI unlocking in next 24 hours
Example: 890,000 PANGI unlocking tomorrow
```

#### Next Week (7 Days)

**Expected Unlocks**:
```
Number of stakes unlocking in next 7 days
Example: 456 unlocks expected this week
```

**Amount Unlocking**:
```
Total PANGI unlocking in next 7 days
Example: 5,600,000 PANGI unlocking this week
```

#### Next Month (30 Days)

**Expected Unlocks**:
```
Number of stakes unlocking in next 30 days
Example: 1,234 unlocks expected this month
```

**Amount Unlocking**:
```
Total PANGI unlocking in next 30 days
Example: 15,000,000 PANGI unlocking this month
```

---

## Dashboard Views

### Admin Dashboard

```typescript
// Fetch global statistics
const stats = await stakingProgram.methods
  .getStatistics()
  .accounts({
    stakingStats: stakingStatsPDA,
  })
  .view();

console.log(`
=== PANGI Staking Dashboard ===

Current Status:
- Total Staked: ${stats.totalStaked / 10**9} PANGI
- Active Stakers: ${stats.totalStakers}
- Avg Stake: ${(stats.totalStaked / stats.totalStakers) / 10**9} PANGI

Lifetime:
- Total Stakes Created: ${stats.totalStakesCreated}
- Total Stakes Completed: ${stats.totalStakesCompleted}
- Total Rewards Paid: ${stats.totalRewardsPaid / 10**9} PANGI
- Completion Rate: ${(stats.totalStakesCompleted / stats.totalStakesCreated * 100).toFixed(2)}%

Today:
- New Stakes: ${stats.stakesToday}
- Unlocks: ${stats.unlocksToday}

This Week:
- New Stakes: ${stats.stakesThisWeek}
- Unlocks: ${stats.unlocksThisWeek}

This Month:
- New Stakes: ${stats.stakesThisMonth}
- Unlocks: ${stats.unlocksThisMonth}
`);
```

### Unlock Schedule Dashboard

```typescript
// Fetch unlock schedule
const schedule = await stakingProgram.methods
  .getUnlockSchedule()
  .accounts({
    unlockSchedule: unlockSchedulePDA,
  })
  .view();

console.log(`
=== Unlock Schedule ===

Next Hour:
- ${schedule.nextHourUnlocks} unlocks
- ${schedule.nextHourAmount / 10**9} PANGI

Next 24 Hours:
- ${schedule.nextDayUnlocks} unlocks
- ${schedule.nextDayAmount / 10**9} PANGI

Next 7 Days:
- ${schedule.nextWeekUnlocks} unlocks
- ${schedule.nextWeekAmount / 10**9} PANGI

Next 30 Days:
- ${schedule.nextMonthUnlocks} unlocks
- ${schedule.nextMonthAmount / 10**9} PANGI
`);
```

### User Dashboard

```typescript
// Fetch user's stake positions
const userStakes = await getUserStakePositions(userWallet);

for (const stake of userStakes) {
  const now = Date.now() / 1000;
  const timeRemaining = stake.endTimestamp - now;
  const daysRemaining = Math.floor(timeRemaining / 86400);
  const hoursRemaining = Math.floor((timeRemaining % 86400) / 3600);
  
  console.log(`
Stake Position:
- Amount: ${stake.amount / 10**9} PANGI
- Duration: ${stake.lockDurationDays} days
- APY: ${stake.apyRate / 100}%
- Started: ${new Date(stake.startTimestamp * 1000).toLocaleDateString()}
- Ends: ${new Date(stake.endTimestamp * 1000).toLocaleDateString()}
- Time Remaining: ${daysRemaining}d ${hoursRemaining}h
- Expected Reward: ${stake.totalReward / 10**9} PANGI
- Status: ${stake.isLocked ? 'Locked' : 'Unlocked'}
- Claimed: ${stake.rewardsClaimed ? 'Yes' : 'No'}
  `);
}
```

---

## Analytics API Endpoints

### GET /staking/stats

**Response**:
```json
{
  "totalStaked": "5000000000000000",
  "totalStakers": 1234,
  "totalRewardsPaid": "250000000000000",
  "totalStakesCreated": 5678,
  "totalStakesCompleted": 4444,
  "stakesToday": 45,
  "stakesThisWeek": 234,
  "stakesThisMonth": 987,
  "unlocksToday": 32,
  "unlocksThisWeek": 189,
  "unlocksThisMonth": 876,
  "averageStakeAmount": "4048582995951",
  "completionRate": 78.26
}
```

### GET /staking/schedule

**Response**:
```json
{
  "nextHour": {
    "unlocks": 3,
    "amount": "45000000000000"
  },
  "nextDay": {
    "unlocks": 67,
    "amount": "890000000000000"
  },
  "nextWeek": {
    "unlocks": 456,
    "amount": "5600000000000000"
  },
  "nextMonth": {
    "unlocks": 1234,
    "amount": "15000000000000000"
  }
}
```

### GET /staking/user/:wallet

**Response**:
```json
{
  "activeStakes": [
    {
      "amount": "10000000000000",
      "lockDurationDays": 90,
      "apyRate": 1200,
      "startTimestamp": 1699564800,
      "endTimestamp": 1707340800,
      "daysRemaining": 45,
      "expectedReward": "296000000000",
      "isLocked": true,
      "rewardsClaimed": false
    }
  ],
  "completedStakes": 3,
  "totalRewardsEarned": "1500000000000",
  "totalStaked": "10000000000000"
}
```

### GET /staking/history

**Query Parameters**:
- `period`: "day" | "week" | "month"
- `limit`: number (default: 30)

**Response**:
```json
{
  "period": "day",
  "data": [
    {
      "date": "2025-11-14",
      "stakesCreated": 45,
      "unlocks": 32,
      "totalStaked": "5000000000000000",
      "rewardsPaid": "8500000000000"
    },
    {
      "date": "2025-11-13",
      "stakesCreated": 52,
      "unlocks": 38,
      "totalStaked": "4950000000000000",
      "rewardsPaid": "9200000000000"
    }
  ]
}
```

---

## Guardian Monitoring System

### Automated Monitoring

```typescript
// Guardian monitoring service
class StakingMonitor {
  async monitorUnlocks() {
    while (true) {
      // Get unlock schedule
      const schedule = await this.getUnlockSchedule();
      
      // Check for imminent unlocks (next hour)
      if (schedule.nextHourUnlocks > 0) {
        console.log(`⚠️ ${schedule.nextHourUnlocks} unlocks in next hour`);
        
        // Get specific stakes unlocking soon
        const imminentStakes = await this.getImminentUnlocks(3600); // 1 hour
        
        for (const stake of imminentStakes) {
          const timeUntilUnlock = stake.endTimestamp - Date.now() / 1000;
          
          if (timeUntilUnlock <= 0) {
            // Lock period ended, report unlock
            await this.reportUnlock(stake);
          } else if (timeUntilUnlock <= 300) {
            // 5 minutes warning
            console.log(`⏰ Stake ${stake.publicKey} unlocking in ${Math.floor(timeUntilUnlock / 60)} minutes`);
          }
        }
      }
      
      // Wait 1 minute before next check
      await sleep(60000);
    }
  }
  
  async reportUnlock(stake: StakePosition) {
    try {
      await stakingProgram.methods
        .reportUnlock()
        .accounts({
          guardianNft: this.guardianWallet.publicKey,
          stakePosition: stake.publicKey,
          stakingStats: stakingStatsPDA,
          unlockSchedule: unlockSchedulePDA,
        })
        .rpc();
      
      console.log(`✅ Unlock reported for ${stake.user}`);
      
      // Notify user
      await this.notifyUser(stake.user, {
        type: 'unlock_complete',
        amount: stake.amount,
        reward: stake.totalReward,
      });
    } catch (error) {
      console.error(`❌ Failed to report unlock: ${error}`);
    }
  }
  
  async getStatistics() {
    const stats = await stakingProgram.methods
      .getStatistics()
      .accounts({ stakingStats: stakingStatsPDA })
      .view();
    
    return {
      totalStaked: stats.totalStaked,
      totalStakers: stats.totalStakers,
      stakesToday: stats.stakesToday,
      unlocksToday: stats.unlocksToday,
      // ... other stats
    };
  }
}

// Start monitoring
const monitor = new StakingMonitor(guardianWallet);
monitor.monitorUnlocks();
```

### Alert System

```typescript
// Alert thresholds
const ALERTS = {
  HIGH_UNLOCK_VOLUME: 100, // Alert if >100 unlocks in next hour
  LOW_REWARD_POOL: 1000000, // Alert if reward pool < 1M PANGI
  HIGH_STAKE_VOLUME: 50, // Alert if >50 new stakes per hour
};

async function checkAlerts() {
  const schedule = await getUnlockSchedule();
  const stats = await getStatistics();
  const rewardPool = await getRewardPoolBalance();
  
  // High unlock volume
  if (schedule.nextHourUnlocks > ALERTS.HIGH_UNLOCK_VOLUME) {
    sendAlert({
      type: 'HIGH_UNLOCK_VOLUME',
      message: `${schedule.nextHourUnlocks} unlocks expected in next hour`,
      severity: 'warning',
    });
  }
  
  // Low reward pool
  if (rewardPool < ALERTS.LOW_REWARD_POOL * 10**9) {
    sendAlert({
      type: 'LOW_REWARD_POOL',
      message: `Reward pool low: ${rewardPool / 10**9} PANGI`,
      severity: 'critical',
    });
  }
  
  // High stake volume
  const stakesPerHour = stats.stakesToday / 24;
  if (stakesPerHour > ALERTS.HIGH_STAKE_VOLUME) {
    sendAlert({
      type: 'HIGH_STAKE_VOLUME',
      message: `High staking activity: ${stakesPerHour.toFixed(0)} stakes/hour`,
      severity: 'info',
    });
  }
}
```

---

## Reporting & Analytics

### Daily Report

```
=== PANGI Staking Daily Report ===
Date: 2025-11-14

Activity:
- New Stakes: 45 (+12% vs yesterday)
- Unlocks: 32 (-5% vs yesterday)
- Net Change: +13 active stakes

Volume:
- Staked Today: 450,000 PANGI
- Unlocked Today: 320,000 PANGI
- Rewards Paid: 8,500 PANGI

Current Status:
- Total Staked: 5,000,000 PANGI
- Active Stakers: 1,234
- Avg Stake Size: 4,048 PANGI

Upcoming:
- Next Hour: 3 unlocks (45,000 PANGI)
- Tomorrow: 67 unlocks (890,000 PANGI)
- This Week: 456 unlocks (5.6M PANGI)
```

### Weekly Report

```
=== PANGI Staking Weekly Report ===
Week: Nov 8-14, 2025

Summary:
- New Stakes: 234
- Unlocks: 189
- Net Growth: +45 active stakes (+3.8%)

Volume:
- Total Staked: 2,340,000 PANGI
- Total Unlocked: 1,890,000 PANGI
- Rewards Paid: 59,500 PANGI

Trends:
- Avg Daily Stakes: 33.4
- Avg Daily Unlocks: 27.0
- Most Popular Duration: 90 days (42%)

Lock Duration Breakdown:
- 30 days: 15%
- 60 days: 18%
- 90 days: 42%
- 180 days: 20%
- 365 days: 5%
```

---

## Summary

**Comprehensive Tracking System**:

✅ **Real-Time Metrics**:
- Total staked, stakers, rewards paid
- Current activity levels

✅ **Time-Based Tracking**:
- Daily, weekly, monthly counters
- Automatic period resets

✅ **Unlock Forecasting**:
- Next hour, day, week, month
- Both count and amount

✅ **Guardian Monitoring**:
- Automated unlock detection
- Immediate reporting
- Alert system

✅ **Analytics Dashboard**:
- Admin view (global stats)
- User view (personal stakes)
- Historical trends

✅ **API Endpoints**:
- Statistics
- Schedule
- User data
- Historical data

**This provides complete visibility into the staking system!**
