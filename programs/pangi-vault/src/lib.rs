use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2");

// Security constants
const MIN_STAKE_AMOUNT: u64 = 1_000_000; // 0.001 tokens (9 decimals)
const MAX_STAKE_AMOUNT: u64 = 1_000_000_000_000_000; // 1M tokens
const MIN_LOCK_DURATION: i64 = 60; // 1 minute
const MAX_LOCK_DURATION: i64 = 365 * 24 * 60 * 60; // 1 year
const REWARD_RATE_DENOMINATOR: u64 = 10000; // For basis points
const CLAIM_COOLDOWN: i64 = 60 * 60; // ✅ ADD: 1 hour between claims
const DEPOSIT_COOLDOWN: i64 = 60; // ✅ ADD: 1 minute between deposits

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

    pub fn deposit_tokens(
        ctx: Context<DepositTokens>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let stake = &ctx.accounts.stake_record;
        let clock = Clock::get()?;

        // Validate vault is active
        require!(vault.is_active, ErrorCode::VaultInactive);

        // Validate authority
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

        // Check lock period
        require!(
            clock.unix_timestamp >= stake.unlock_at,
            ErrorCode::StillLocked
        );

        // Input validation
        require!(amount > 0, ErrorCode::AmountTooSmall);
        require!(amount <= stake.amount, ErrorCode::InsufficientStake);

        // Calculate pending rewards before withdrawal
        let pending_rewards = calculate_pending_rewards(
            stake.amount,
            vault.reward_rate,
            stake.last_claim,
            clock.unix_timestamp,
        )?;

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
            remaining_stake: stake.amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let stake = &mut ctx.accounts.stake_record;
        let clock = Clock::get()?;

        // Validate authority
        require!(
            ctx.accounts.authority.key() == stake.authority,
            ErrorCode::Unauthorized
        );

        // Validate vault is active
        require!(vault.is_active, ErrorCode::VaultInactive);
        
        // ✅ CLAIM COOLDOWN CHECK (prevent spam claims)
        let time_since_last_claim = clock
            .unix_timestamp
            .checked_sub(stake.last_claim)
            .ok_or(ErrorCode::Overflow)?;
        
        require!(
            time_since_last_claim >= CLAIM_COOLDOWN,
            ErrorCode::ClaimCooldownActive
        );

        // Calculate pending rewards
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

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub nft_mint: Pubkey,
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub vault_token_account: Pubkey,
    pub total_staked: u64,
    pub reward_rate: u16,
    pub lock_duration: i64,
    pub created_at: i64,
    pub last_reward_update: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StakeRecord {
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub unlock_at: i64,
    pub last_claim: i64,
    pub total_claimed: u64,
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
    pub pending_rewards: u64,
    pub remaining_stake: u64,
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
