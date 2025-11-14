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
7. Guardian reports unlock immediately
```

**Key Principle**: **Self-Custody Staking**
- ✅ User maintains custody of tokens
- ✅ Tokens locked in user's wallet (not transferred)
- ✅ Staking program tracks lock status
- ✅ Rewards calculated by PANGI.sol
- ✅ Guardian monitors and reports

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────┐
│         Master NFT #42                              │
│  Creates Staking Subdomain                          │
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
└────────────────┬────────────────────────────────────┘
                 │ governed by
┌────────────────▼────────────────────────────────────┐
│         PANGI.sol (Governance)                      │
│  • Sets APY rates                                   │
│  • Sets lock duration tiers                         │
│  • Controls reward pool                             │
└─────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│         Guardian NFT (Monitor)                      │
│  • Monitors staking wallet                          │
│  • Reports unlock events                            │
│  • Triggers reward distribution                     │
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

        // Create stake position
        let stake_position = &mut ctx.accounts.stake_position;
        stake_position.user = ctx.accounts.user.key();
        stake_position.staking_wallet = ctx.accounts.staking_wallet.key();
        stake_position.amount = amount;
        stake_position.lock_duration_days = lock_duration_days;
        stake_position.start_timestamp = Clock::get()?.unix_timestamp;
        stake_position.end_timestamp = stake_position.start_timestamp + 
            (lock_duration_days as i64 * 86400);
        stake_position.apy_rate = get_apy_for_duration(lock_duration_days)?;
        stake_position.is_locked = true;
        stake_position.guardian_monitor = ctx.accounts.guardian_nft.key();

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

    // Guardian reports unlock
    pub fn report_unlock(
        ctx: Context<ReportUnlock>,
    ) -> Result<()> {
        let stake_position = &mut ctx.accounts.stake_position;
        let clock = Clock::get()?;

        // Verify Guardian authority
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

        emit!(UnlockReported {
            user: stake_position.user,
            amount: stake_position.amount,
            total_reward,
            days_staked,
        });

        Ok(())
    }

    // User claims rewards
    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
    ) -> Result<()> {
        let stake_position = &mut ctx.accounts.stake_position;

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

        // Mark as claimed
        stake_position.rewards_claimed = true;
        stake_position.claim_timestamp = Some(Clock::get()?.unix_timestamp);

        emit!(RewardsClaimed {
            user: stake_position.user,
            amount: stake_position.total_reward,
        });

        Ok(())
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
    pub guardian_monitor: Pubkey,
}

// Constants
const VALID_LOCK_DURATIONS: &[u16] = &[30, 60, 90, 180, 365];

// APY tiers (basis points)
const APY_30_DAYS: u16 = 500;    // 5%
const APY_60_DAYS: u16 = 800;    // 8%
const APY_90_DAYS: u16 = 1200;   // 12%
const APY_180_DAYS: u16 = 1800;  // 18%
const APY_365_DAYS: u16 = 2500;  // 25%

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

### 4. User Claims Rewards

```typescript
// After unlock reported, user claims rewards
const stakePosition = await getStakePosition(userWallet);

if (!stakePosition.isLocked && !stakePosition.rewardsClaimed) {
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

| Lock Duration | APY | Daily Rate | Example (10,000 PANGI) |
|---------------|-----|------------|------------------------|
| 30 days | 5% | 0.0137% | 500 PANGI total |
| 60 days | 8% | 0.0219% | 800 PANGI total |
| 90 days | 12% | 0.0329% | 1,200 PANGI total |
| 180 days | 18% | 0.0493% | 1,800 PANGI total |
| 365 days | 25% | 0.0685% | 2,500 PANGI total |

**Calculation**:
```
Daily Reward = (Amount × APY) / 365
Total Reward = Daily Reward × Lock Duration Days

Example (10,000 PANGI, 90 days, 12% APY):
Daily Reward = (10,000 × 0.12) / 365 = 3.29 PANGI/day
Total Reward = 3.29 × 90 = 296 PANGI
```

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
