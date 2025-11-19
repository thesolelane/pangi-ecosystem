use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2");

// PANGI Vault - Self-Custody Staking System
// 
// REPORTING MODEL: Self-Custody Mandatory Reporting
// - Users maintain custody of tokens (tokens locked in user's wallet)
// - Guardian reports OUT only (no inbound data from PANGI)
// - Master NFT installs Guardian reporting configuration
// - Guardian sends reports to public address where rewards are sent
// - One-way reporting: Guardian → Public Address (never Public Address → Guardian)
//
// MASTER NFT ROLE:
// - Creates staking subdomain
// - Installs accurate reporting configuration for Guardian
// - Configures public address for Guardian reports
// - Sets Guardian permissions and reporting rules
//
// GUARDIAN NFT ROLE:
// - Monitors staking wallet (read-only)
// - Reports unlock events to configured public address
// - Reports OUT only (receives NO data from PANGI)
// - Cannot receive information from PANGI protocol
//
// SECURITY: Self-custody means users are responsible for their own keys
// PANGI cannot recover lost Master NFTs or access user wallets

// Security constants
const MIN_STAKE_AMOUNT: u64 = 1_000_000; // 0.001 tokens (9 decimals)
const MAX_STAKE_AMOUNT: u64 = 1_000_000_000_000_000; // 1M tokens
const MIN_LOCK_DURATION: i64 = 60; // 1 minute
const MAX_LOCK_DURATION: i64 = 365 * 24 * 60 * 60; // 1 year
const REWARD_RATE_DENOMINATOR: u64 = 10000; // For basis points
const CLAIM_COOLDOWN: i64 = 60 * 60; // 1 hour between claims
const DEPOSIT_COOLDOWN: i64 = 60; // 1 minute between deposits
const EARLY_UNLOCK_PENALTY_BPS: u16 = 1500; // 15% penalty for early unlock

// Safe math macros for overflow protection
macro_rules! safe_add {
    ($a:expr, $b:expr) => {{
        $a.checked_add($b).ok_or(ErrorCode::Overflow)?
    }};
}

macro_rules! safe_sub {
    ($a:expr, $b:expr) => {{
        $a.checked_sub($b).ok_or(ErrorCode::Underflow)?
    }};
}

macro_rules! safe_mul {
    ($a:expr, $b:expr) => {{
        $a.checked_mul($b).ok_or(ErrorCode::Overflow)?
    }};
}

macro_rules! safe_div {
    ($a:expr, $b:expr) => {{
        let divisor = $b;
        if divisor == 0 {
            return Err(ErrorCode::DivisionByZero.into());
        }
        $a.checked_div(divisor).ok_or(ErrorCode::Underflow)?
    }};
}

macro_rules! safe_percentage {
    ($amount:expr, $basis_points:expr) => {{
        safe_div!(safe_mul!($amount, $basis_points as u64), 10000u64)
    }};
}

#[program]
pub mod pangi_vault {
    use super::*;

    pub fn create_vault(
        ctx: Context<CreateVault>,
        reward_rate: u16,
        lock_duration: i64,
    ) -> Result<()> {
        // Input validation
        require!(
            reward_rate <= 10000, // Max 100% APY
            ErrorCode::RewardRateTooHigh
        );
        require!(
            lock_duration >= MIN_LOCK_DURATION,
            ErrorCode::LockDurationTooShort
        );
        require!(
            lock_duration <= MAX_LOCK_DURATION,
            ErrorCode::LockDurationTooLong
        );

        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;
        
        vault.nft_mint = ctx.accounts.nft_mint.key();
        vault.authority = ctx.accounts.authority.key();
        vault.token_mint = ctx.accounts.token_mint.key();
        vault.vault_token_account = ctx.accounts.vault_token_account.key();
        vault.total_staked = 0;
        vault.reward_rate = reward_rate;
        vault.lock_duration = lock_duration;
        vault.created_at = clock.unix_timestamp;
        vault.last_reward_update = clock.unix_timestamp;
        vault.total_penalties_collected = 0;
        vault.is_active = true;
        vault.bump = ctx.bumps.vault;
        
        emit!(VaultCreatedEvent {
            nft_mint: vault.nft_mint,
            vault: ctx.accounts.vault.key(),
            authority: vault.authority,
            reward_rate,
            lock_duration,
            timestamp: vault.created_at,
        });
        
        Ok(())
    }

    /// Deposit tokens into vault (self-custody staking)
    /// Tokens are transferred to vault but user maintains custody through Master NFT
    /// Master NFT holder can configure Guardian reporting for this stake
    pub fn deposit_tokens(
        ctx: Context<DepositTokens>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let stake = &ctx.accounts.stake_record;
        let clock = Clock::get()?;

        // Validate vault is active
        require!(vault.is_active, ErrorCode::VaultInactive);

        // Validate authority (Master NFT holder)
        require!(
            ctx.accounts.authority.key() == vault.authority,
            ErrorCode::VaultAuthorityMismatch
        );
        
        // ✅ DEPOSIT COOLDOWN CHECK (prevent spam)
        if stake.amount > 0 {
            let time_since_last_deposit = safe_sub!(clock.unix_timestamp, stake.staked_at);
            
            require!(
                time_since_last_deposit >= DEPOSIT_COOLDOWN,
                ErrorCode::DepositCooldownActive
            );
        }

        // Input validation
        require!(amount >= MIN_STAKE_AMOUNT, ErrorCode::AmountTooSmall);
        require!(amount <= MAX_STAKE_AMOUNT, ErrorCode::AmountTooLarge);

        // Check user has sufficient balance
        require!(
            ctx.accounts.user_token_account.amount >= amount,
            ErrorCode::InsufficientBalance
        );

        // Calculate new total with overflow protection
        let new_total = safe_add!(vault.total_staked, amount);

        // Transfer tokens from user to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update vault state
        vault.total_staked = new_total;
        vault.last_reward_update = clock.unix_timestamp;

        // Create or update stake record
        let stake = &mut ctx.accounts.stake_record;
        if stake.amount == 0 {
            // New stake
            stake.vault = ctx.accounts.vault.key();
            stake.authority = ctx.accounts.authority.key();
            stake.amount = amount;
            stake.staked_at = clock.unix_timestamp;
            stake.unlock_at = safe_add!(clock.unix_timestamp, vault.lock_duration);
            stake.last_claim = clock.unix_timestamp;
            stake.total_claimed = 0;
        } else {
            // Add to existing stake
            stake.amount = safe_add!(stake.amount, amount);
        }

        emit!(TokensDepositedEvent {
            vault: ctx.accounts.vault.key(),
            authority: ctx.accounts.authority.key(),
            amount,
            total_staked: vault.total_staked,
            unlock_at: stake.unlock_at,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Withdraw staked tokens
    /// If withdrawn before unlock_at: user gets principal but 0 rewards (early unlock penalty)
    /// If withdrawn after unlock_at: user gets principal and can claim rewards separately
    pub fn withdraw_tokens(
        ctx: Context<WithdrawTokens>,
        amount: u64,
    ) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let stake = &mut ctx.accounts.stake_record;
        let clock = Clock::get()?;

        // Validate authority
        require!(
            ctx.accounts.authority.key() == stake.authority,
            ErrorCode::Unauthorized
        );

        // Input validation
        require!(amount > 0, ErrorCode::AmountTooSmall);
        require!(amount <= stake.amount, ErrorCode::InsufficientStake);

        // Check if early unlock (before lock period ends)
        let is_early_unlock = clock.unix_timestamp < stake.unlock_at;
        
        // Calculate rewards based on unlock timing
        let (pending_rewards, penalty_to_pool) = if is_early_unlock {
            // Early unlock: proportional rewards - 15% penalty
            let (user_payout, penalty) = calculate_early_unlock_rewards(
                stake.amount,
                vault.reward_rate,
                stake.staked_at,
                stake.unlock_at,
                clock.unix_timestamp,
            )?;
            
            let days_early = safe_div!(
                safe_sub!(stake.unlock_at, clock.unix_timestamp),
                86400  // seconds per day
            );
            
            emit!(EarlyUnlockEvent {
                vault: ctx.accounts.vault.key(),
                authority: ctx.accounts.authority.key(),
                amount,
                forfeited_rewards: penalty,  // 15% penalty goes to pool
                unlock_at: stake.unlock_at,
                unlocked_at: clock.unix_timestamp,
                days_early,
            });
            
            (user_payout, penalty)
        } else {
            // Normal unlock: full rewards, no penalty
            let full_rewards = calculate_pending_rewards(
                stake.amount,
                vault.reward_rate,
                stake.last_claim,
                clock.unix_timestamp,
            )?;
            (full_rewards, 0)
        };

        // If there's a penalty, it stays in the vault (reward pool)
        // Track total penalties collected for transparency
        if penalty_to_pool > 0 {
            let vault = &mut ctx.accounts.vault;
            vault.total_penalties_collected = safe_add!(
                vault.total_penalties_collected,
                penalty_to_pool
            );
        }

        // Update stake record
        stake.amount = stake
            .amount
            .checked_sub(amount)
            .ok_or(ErrorCode::Underflow)?;

        // Transfer tokens from vault to user
        let seeds = &[
            b"vault",
            vault.nft_mint.as_ref(),
            &[vault.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        // Update vault total
        let vault = &mut ctx.accounts.vault;
        vault.total_staked = vault
            .total_staked
            .checked_sub(amount)
            .ok_or(ErrorCode::Underflow)?;

        emit!(TokensWithdrawnEvent {
            vault: ctx.accounts.vault.key(),
            authority: ctx.accounts.authority.key(),
            amount,
            pending_rewards,
            penalty_to_pool,  // Amount returned to pool (0 if normal unlock)
            remaining_stake: stake.amount,
            is_early_unlock,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Claim staking rewards
    /// Guardian can report this claim event OUT to configured public address
    /// Guardian receives NO data from PANGI (one-way reporting)
    /// NOTE: Can only claim rewards if lock period has ended (unlock_at reached)
    /// Early unlock = 0 rewards (penalty enforced in withdraw_tokens)
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let stake = &mut ctx.accounts.stake_record;
        let clock = Clock::get()?;

        // Validate authority (Master NFT holder or authorized Guardian)
        require!(
            ctx.accounts.authority.key() == stake.authority,
            ErrorCode::Unauthorized
        );

        // Validate vault is active
        require!(vault.is_active, ErrorCode::VaultInactive);
        
        // Validate lock period has ended (no rewards before unlock_at)
        require!(
            clock.unix_timestamp >= stake.unlock_at,
            ErrorCode::StillLocked
        );
        
        // ✅ CLAIM COOLDOWN CHECK (prevent spam claims)
        let time_since_last_claim = clock
            .unix_timestamp
            .checked_sub(stake.last_claim)
            .ok_or(ErrorCode::Overflow)?;
        
        require!(
            time_since_last_claim >= CLAIM_COOLDOWN,
            ErrorCode::ClaimCooldownActive
        );

        // Calculate pending rewards (only if lock period completed)
        let pending_rewards = calculate_pending_rewards(
            stake.amount,
            vault.reward_rate,
            stake.last_claim,
            clock.unix_timestamp,
        )?;

        require!(pending_rewards > 0, ErrorCode::NoRewardsToClaim);

        // Check vault has sufficient balance for rewards
        require!(
            ctx.accounts.vault_token_account.amount >= pending_rewards,
            ErrorCode::InsufficientVaultBalance
        );

        // Transfer rewards
        let seeds = &[
            b"vault",
            vault.nft_mint.as_ref(),
            &[vault.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            pending_rewards,
        )?;

        // Update stake record
        stake.last_claim = clock.unix_timestamp;
        stake.total_claimed = stake
            .total_claimed
            .checked_add(pending_rewards)
            .ok_or(ErrorCode::Overflow)?;

        emit!(RewardsClaimedEvent {
            vault: ctx.accounts.vault.key(),
            authority: ctx.accounts.authority.key(),
            amount: pending_rewards,
            total_claimed: stake.total_claimed,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn deactivate_vault(ctx: Context<DeactivateVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(
            ctx.accounts.authority.key() == vault.authority,
            ErrorCode::Unauthorized
        );

        require!(vault.is_active, ErrorCode::VaultAlreadyInactive);

        vault.is_active = false;

        emit!(VaultDeactivatedEvent {
            vault: ctx.accounts.vault.key(),
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Helper function to calculate pending rewards
fn calculate_pending_rewards(
    staked_amount: u64,
    reward_rate: u16,
    last_claim: i64,
    current_time: i64,
) -> Result<u64> {
    // Calculate time elapsed with overflow protection
    let time_elapsed = current_time
        .checked_sub(last_claim)
        .ok_or(ErrorCode::Overflow)?;

    if time_elapsed <= 0 {
        return Ok(0);
    }

    // Calculate rewards: (amount * rate * time) / (denominator * seconds_per_year)
    // Using u128 to prevent overflow
    let seconds_per_year: u128 = 365 * 24 * 60 * 60;
    
    let rewards = (staked_amount as u128)
        .checked_mul(reward_rate as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_mul(time_elapsed as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(REWARD_RATE_DENOMINATOR as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(seconds_per_year)
        .ok_or(ErrorCode::Overflow)?;

    // Ensure result fits in u64
    require!(rewards <= u64::MAX as u128, ErrorCode::Overflow);

    Ok(rewards as u64)
}

// Calculate early unlock rewards with 15% penalty
// Returns (user_payout, penalty_amount)
// penalty_amount goes back to reward pool
fn calculate_early_unlock_rewards(
    staked_amount: u64,
    reward_rate: u16,
    staked_at: i64,
    unlock_at: i64,
    current_time: i64,
) -> Result<(u64, u64)> {
    // Calculate time actually staked
    let time_staked = safe_sub!(current_time, staked_at);
    
    // Calculate total lock duration
    let lock_duration = safe_sub!(unlock_at, staked_at);
    
    // Calculate total potential rewards for full duration
    let total_potential_rewards = calculate_pending_rewards(
        staked_amount,
        reward_rate,
        staked_at,
        unlock_at,
    )?;
    
    // Calculate proportional rewards based on time actually staked
    // proportional_rewards = (time_staked / lock_duration) × total_potential_rewards
    let proportional_rewards = (total_potential_rewards as u128)
        .checked_mul(time_staked as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(lock_duration as u128)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    require!(proportional_rewards <= u64::MAX as u128, ErrorCode::Overflow);
    let proportional_rewards = proportional_rewards as u64;
    
    // Apply 15% penalty
    let penalty_amount = safe_percentage!(proportional_rewards, EARLY_UNLOCK_PENALTY_BPS);
    let user_payout = safe_sub!(proportional_rewards, penalty_amount);
    
    // Return (user_payout, penalty_amount)
    // penalty_amount will be returned to reward pool
    Ok((user_payout, penalty_amount))
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", nft_mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub nft_mint: Account<'info, Mint>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = vault,
        seeds = [b"vault_tokens", vault.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositTokens<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.nft_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + StakeRecord::INIT_SPACE,
        seeds = [b"stake", vault.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub stake_record: Account<'info, StakeRecord>,
    #[account(
        mut,
        constraint = user_token_account.owner == authority.key() @ ErrorCode::Unauthorized
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.vault_token_account @ ErrorCode::InvalidVaultAccount
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.nft_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        seeds = [b"stake", vault.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub stake_record: Account<'info, StakeRecord>,
    #[account(
        mut,
        constraint = user_token_account.owner == authority.key() @ ErrorCode::Unauthorized
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.vault_token_account @ ErrorCode::InvalidVaultAccount
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        seeds = [b"vault", vault.nft_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        seeds = [b"stake", vault.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub stake_record: Account<'info, StakeRecord>,
    #[account(
        mut,
        constraint = user_token_account.owner == authority.key() @ ErrorCode::Unauthorized
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.vault_token_account @ ErrorCode::InvalidVaultAccount
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DeactivateVault<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.nft_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>,
}

/// Vault account - Self-custody staking vault
/// Master NFT creates vault and installs Guardian reporting configuration
#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub nft_mint: Pubkey,              // Master NFT that created this vault
    pub authority: Pubkey,             // Vault authority (Master NFT holder)
    pub token_mint: Pubkey,            // PANGI token mint
    pub vault_token_account: Pubkey,   // Vault's token account (holds staked tokens)
    pub total_staked: u64,             // Total tokens staked in this vault
    pub reward_rate: u16,              // Reward rate in basis points
    pub lock_duration: i64,            // Lock duration in seconds
    pub created_at: i64,               // Vault creation timestamp
    pub last_reward_update: i64,       // Last reward calculation timestamp
    pub total_penalties_collected: u64, // Total 15% penalties returned to pool
    pub is_active: bool,               // Vault active status
    pub bump: u8,                      // PDA bump seed
}

/// StakeRecord - Individual user stake position
/// Tracks user's staked tokens and Guardian reporting configuration
#[account]
#[derive(InitSpace)]
pub struct StakeRecord {
    pub vault: Pubkey,                 // Parent vault
    pub authority: Pubkey,             // User who staked (Master NFT holder)
    pub amount: u64,                   // Amount staked (tokens remain in user custody)
    pub staked_at: i64,                // Stake creation timestamp
    pub unlock_at: i64,                // Unlock timestamp (when Guardian reports)
    pub last_claim: i64,               // Last reward claim timestamp
    pub total_claimed: u64,            // Total rewards claimed
    // Guardian reporting configuration (installed by Master)
    // Guardian reports OUT to public address when unlock_at is reached
    // Guardian receives NO data from PANGI (one-way reporting)
}

#[event]
pub struct VaultCreatedEvent {
    pub nft_mint: Pubkey,
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub reward_rate: u16,
    pub lock_duration: i64,
    pub timestamp: i64,
}

#[event]
pub struct TokensDepositedEvent {
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub unlock_at: i64,
    pub timestamp: i64,
}

#[event]
pub struct TokensWithdrawnEvent {
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub amount: u64,
    pub pending_rewards: u64,       // Rewards paid to user (proportional - 15% if early)
    pub penalty_to_pool: u64,       // 15% penalty returned to pool (0 if normal unlock)
    pub remaining_stake: u64,
    pub is_early_unlock: bool,      // true if withdrawn before unlock_at
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimedEvent {
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub amount: u64,
    pub total_claimed: u64,
    pub timestamp: i64,
}

#[event]
pub struct VaultDeactivatedEvent {
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct EarlyUnlockEvent {
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub amount: u64,
    pub forfeited_rewards: u64,  // Rewards that would have been earned
    pub unlock_at: i64,           // Original unlock timestamp
    pub unlocked_at: i64,         // Actual unlock timestamp (early)
    pub days_early: i64,          // How many days early
}

#[error_code]
pub enum ErrorCode {
    #[msg("Vault authority mismatch")]
    VaultAuthorityMismatch,
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,
    #[msg("Arithmetic overflow detected")]
    Overflow,
    #[msg("Arithmetic underflow detected")]
    Underflow,
    #[msg("Amount too small for staking")]
    AmountTooSmall,
    #[msg("Amount too large for staking")]
    AmountTooLarge,
    #[msg("Insufficient balance for operation")]
    InsufficientBalance,
    #[msg("Insufficient staked amount for withdrawal")]
    InsufficientStake,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("Reward rate too high (max 100%)")]
    RewardRateTooHigh,
    #[msg("Lock duration too short (minimum 1 minute)")]
    LockDurationTooShort,
    #[msg("Lock duration too long (maximum 1 year)")]
    LockDurationTooLong,
    #[msg("Vault is inactive")]
    VaultInactive,
    #[msg("Vault is already inactive")]
    VaultAlreadyInactive,
    #[msg("No rewards available to claim")]
    NoRewardsToClaim,
    #[msg("Insufficient vault balance for rewards")]
    InsufficientVaultBalance,
    #[msg("Invalid vault token account")]
    InvalidVaultAccount,
    #[msg("Deposit cooldown active - please wait before depositing again")]
    DepositCooldownActive,
    #[msg("Claim cooldown active - please wait before claiming again")]
    ClaimCooldownActive,
    #[msg("Division by zero")]
    DivisionByZero,
}
