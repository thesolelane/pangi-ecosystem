use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq");

// Security constants
const MAX_SPECIAL_NFTS: u8 = 25;
const MIN_DISTRIBUTION_PERIOD: i64 = 24 * 60 * 60; // 1 day
const MAX_DISTRIBUTION_PERIOD: i64 = 365 * 24 * 60 * 60; // 1 year
const TOTAL_DISTRIBUTION_SUPPLY: u64 = 63_000_000_000_000_000; // 63M tokens with 9 decimals

#[program]
pub mod special_distribution {
    use super::*;

    pub fn initialize_distribution(
        ctx: Context<InitializeDistribution>,
        total_supply: u64,
        distribution_start: i64,
        distribution_end: i64,
    ) -> Result<()> {
        let clock = Clock::get()?;

        // Input validation
        require!(
            total_supply == TOTAL_DISTRIBUTION_SUPPLY,
            ErrorCode::InvalidTotalSupply
        );

        require!(
            distribution_start >= clock.unix_timestamp,
            ErrorCode::InvalidStartTime
        );

        require!(
            distribution_end > distribution_start,
            ErrorCode::InvalidEndTime
        );

        let duration = distribution_end
            .checked_sub(distribution_start)
            .ok_or(ErrorCode::Overflow)?;

        require!(
            duration >= MIN_DISTRIBUTION_PERIOD,
            ErrorCode::DistributionPeriodTooShort
        );

        require!(
            duration <= MAX_DISTRIBUTION_PERIOD,
            ErrorCode::DistributionPeriodTooLong
        );

        // Verify distribution account has sufficient balance
        require!(
            ctx.accounts.distribution_token_account.amount >= total_supply,
            ErrorCode::InsufficientDistributionBalance
        );

        let config = &mut ctx.accounts.distribution_config;
        
        config.authority = ctx.accounts.authority.key();
        config.token_mint = ctx.accounts.token_mint.key();
        config.distribution_token_account = ctx.accounts.distribution_token_account.key();
        config.total_supply = total_supply;
        config.distributed_amount = 0;
        config.distribution_start = distribution_start;
        config.distribution_end = distribution_end;
        config.nft_count = 0;
        config.is_active = true;
        config.bump = ctx.bumps.distribution_config;

        emit!(DistributionInitializedEvent {
            authority: config.authority,
            total_supply,
            distribution_start,
            distribution_end,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn register_special_nft(
        ctx: Context<RegisterSpecialNFT>,
        allocation: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.distribution_config;

        // Validate authority
        require!(
            ctx.accounts.authority.key() == config.authority,
            ErrorCode::Unauthorized
        );

        // Check NFT limit
        require!(
            config.nft_count < MAX_SPECIAL_NFTS,
            ErrorCode::MaxNFTsReached
        );

        // Validate allocation
        require!(allocation > 0, ErrorCode::InvalidAllocation);

        // Check total allocation doesn't exceed supply
        let new_distributed = config
            .distributed_amount
            .checked_add(allocation)
            .ok_or(ErrorCode::Overflow)?;

        require!(
            new_distributed <= config.total_supply,
            ErrorCode::AllocationExceedsSupply
        );

        // Initialize NFT allocation record
        let nft_allocation = &mut ctx.accounts.nft_allocation;
        nft_allocation.distribution_config = ctx.accounts.distribution_config.key();
        nft_allocation.nft_mint = ctx.accounts.nft_mint.key();
        nft_allocation.owner = ctx.accounts.nft_owner.key();
        nft_allocation.total_allocation = allocation;
        nft_allocation.claimed_amount = 0;
        nft_allocation.last_claim = 0;
        nft_allocation.is_active = true;

        // Update config
        config.nft_count = config
            .nft_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        emit!(SpecialNFTRegisteredEvent {
            nft_mint: nft_allocation.nft_mint,
            owner: nft_allocation.owner,
            allocation,
            nft_count: config.nft_count,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let config = &ctx.accounts.distribution_config;
        let nft_allocation = &mut ctx.accounts.nft_allocation;
        let clock = Clock::get()?;

        // Validate distribution is active
        require!(config.is_active, ErrorCode::DistributionInactive);
        require!(nft_allocation.is_active, ErrorCode::AllocationInactive);

        // Validate authority
        require!(
            ctx.accounts.claimant.key() == nft_allocation.owner,
            ErrorCode::Unauthorized
        );

        // Check distribution period
        require!(
            clock.unix_timestamp >= config.distribution_start,
            ErrorCode::DistributionNotStarted
        );

        // Calculate claimable amount
        let claimable = calculate_claimable_amount(
            nft_allocation.total_allocation,
            nft_allocation.claimed_amount,
            config.distribution_start,
            config.distribution_end,
            clock.unix_timestamp,
        )?;

        require!(claimable > 0, ErrorCode::NoRewardsToClaim);

        // Verify distribution account has sufficient balance
        require!(
            ctx.accounts.distribution_token_account.amount >= claimable,
            ErrorCode::InsufficientDistributionBalance
        );

        // Update allocation record
        nft_allocation.claimed_amount = nft_allocation
            .claimed_amount
            .checked_add(claimable)
            .ok_or(ErrorCode::Overflow)?;
        nft_allocation.last_claim = clock.unix_timestamp;

        // Transfer tokens
        let seeds = &[
            b"distribution_config",
            &[config.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.distribution_token_account.to_account_info(),
                    to: ctx.accounts.claimant_token_account.to_account_info(),
                    authority: ctx.accounts.distribution_config.to_account_info(),
                },
                signer,
            ),
            claimable,
        )?;

        // Update config
        let config = &mut ctx.accounts.distribution_config;
        config.distributed_amount = config
            .distributed_amount
            .checked_add(claimable)
            .ok_or(ErrorCode::Overflow)?;

        emit!(RewardsClaimedEvent {
            nft_mint: nft_allocation.nft_mint,
            claimant: ctx.accounts.claimant.key(),
            amount: claimable,
            total_claimed: nft_allocation.claimed_amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn distribute_to_vault(
        ctx: Context<DistributeToVault>,
        amount: u64,
    ) -> Result<()> {
        let config = &ctx.accounts.distribution_config;

        // Validate authority
        require!(
            ctx.accounts.authority.key() == config.authority,
            ErrorCode::Unauthorized
        );

        // Validate distribution is active
        require!(config.is_active, ErrorCode::DistributionInactive);

        // Input validation
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Check available balance
        let remaining = config
            .total_supply
            .checked_sub(config.distributed_amount)
            .ok_or(ErrorCode::Underflow)?;

        require!(amount <= remaining, ErrorCode::InsufficientRemainingSupply);

        // Verify distribution account has sufficient balance
        require!(
            ctx.accounts.distribution_token_account.amount >= amount,
            ErrorCode::InsufficientDistributionBalance
        );

        // Transfer tokens to vault
        let seeds = &[
            b"distribution_config",
            &[config.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.distribution_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.distribution_config.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        // Update config
        let config = &mut ctx.accounts.distribution_config;
        config.distributed_amount = config
            .distributed_amount
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        emit!(DistributedToVaultEvent {
            vault: ctx.accounts.vault_token_account.key(),
            amount,
            total_distributed: config.distributed_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn deactivate_distribution(ctx: Context<DeactivateDistribution>) -> Result<()> {
        let config = &mut ctx.accounts.distribution_config;

        require!(
            ctx.accounts.authority.key() == config.authority,
            ErrorCode::Unauthorized
        );

        require!(config.is_active, ErrorCode::DistributionAlreadyInactive);

        config.is_active = false;

        emit!(DistributionDeactivatedEvent {
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn deactivate_allocation(ctx: Context<DeactivateAllocation>) -> Result<()> {
        let config = &ctx.accounts.distribution_config;
        let nft_allocation = &mut ctx.accounts.nft_allocation;

        require!(
            ctx.accounts.authority.key() == config.authority,
            ErrorCode::Unauthorized
        );

        require!(nft_allocation.is_active, ErrorCode::AllocationAlreadyInactive);

        nft_allocation.is_active = false;

        emit!(AllocationDeactivatedEvent {
            nft_mint: nft_allocation.nft_mint,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Helper function to calculate claimable amount based on vesting schedule
fn calculate_claimable_amount(
    total_allocation: u64,
    claimed_amount: u64,
    distribution_start: i64,
    distribution_end: i64,
    current_time: i64,
) -> Result<u64> {
    // If distribution hasn't started, nothing is claimable
    if current_time < distribution_start {
        return Ok(0);
    }

    // Calculate vested amount based on linear vesting
    let vested_amount = if current_time >= distribution_end {
        // Distribution period ended, all tokens are vested
        total_allocation
    } else {
        // Calculate proportional vesting
        let elapsed = current_time
            .checked_sub(distribution_start)
            .ok_or(ErrorCode::Overflow)?;

        let total_duration = distribution_end
            .checked_sub(distribution_start)
            .ok_or(ErrorCode::Overflow)?;

        // Use u128 to prevent overflow
        let vested = (total_allocation as u128)
            .checked_mul(elapsed as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(total_duration as u128)
            .ok_or(ErrorCode::Overflow)?;

        require!(vested <= u64::MAX as u128, ErrorCode::Overflow);
        vested as u64
    };

    // Calculate claimable (vested - already claimed)
    let claimable = vested
        .checked_sub(claimed_amount)
        .ok_or(ErrorCode::Underflow)?;

    Ok(claimable)
}

#[derive(Accounts)]
pub struct InitializeDistribution<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + DistributionConfig::INIT_SPACE,
        seeds = [b"distribution_config"],
        bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    /// CHECK: Token mint, validated by token program
    pub token_mint: AccountInfo<'info>,
    #[account(
        mut,
        constraint = distribution_token_account.mint == token_mint.key() @ ErrorCode::InvalidTokenMint
    )]
    pub distribution_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterSpecialNFT<'info> {
    #[account(
        mut,
        seeds = [b"distribution_config"],
        bump = distribution_config.bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    #[account(
        init,
        payer = authority,
        space = 8 + NFTAllocation::INIT_SPACE,
        seeds = [b"nft_allocation", nft_mint.key().as_ref()],
        bump
    )]
    pub nft_allocation: Account<'info, NFTAllocation>,
    /// CHECK: NFT mint, validated by caller
    pub nft_mint: AccountInfo<'info>,
    /// CHECK: NFT owner, validated by caller
    pub nft_owner: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [b"distribution_config"],
        bump = distribution_config.bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    #[account(
        mut,
        seeds = [b"nft_allocation", nft_allocation.nft_mint.as_ref()],
        bump
    )]
    pub nft_allocation: Account<'info, NFTAllocation>,
    #[account(
        mut,
        constraint = distribution_token_account.key() == distribution_config.distribution_token_account @ ErrorCode::InvalidDistributionAccount
    )]
    pub distribution_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = claimant_token_account.owner == claimant.key() @ ErrorCode::Unauthorized
    )]
    pub claimant_token_account: Account<'info, TokenAccount>,
    pub claimant: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DistributeToVault<'info> {
    #[account(
        mut,
        seeds = [b"distribution_config"],
        bump = distribution_config.bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    #[account(
        mut,
        constraint = distribution_token_account.key() == distribution_config.distribution_token_account @ ErrorCode::InvalidDistributionAccount
    )]
    pub distribution_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DeactivateDistribution<'info> {
    #[account(
        mut,
        seeds = [b"distribution_config"],
        bump = distribution_config.bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateAllocation<'info> {
    #[account(
        seeds = [b"distribution_config"],
        bump = distribution_config.bump
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    #[account(
        mut,
        seeds = [b"nft_allocation", nft_allocation.nft_mint.as_ref()],
        bump
    )]
    pub nft_allocation: Account<'info, NFTAllocation>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct DistributionConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub distribution_token_account: Pubkey,
    pub total_supply: u64,
    pub distributed_amount: u64,
    pub distribution_start: i64,
    pub distribution_end: i64,
    pub nft_count: u8,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct NFTAllocation {
    pub distribution_config: Pubkey,
    pub nft_mint: Pubkey,
    pub owner: Pubkey,
    pub total_allocation: u64,
    pub claimed_amount: u64,
    pub last_claim: i64,
    pub is_active: bool,
}

#[event]
pub struct DistributionInitializedEvent {
    pub authority: Pubkey,
    pub total_supply: u64,
    pub distribution_start: i64,
    pub distribution_end: i64,
    pub timestamp: i64,
}

#[event]
pub struct SpecialNFTRegisteredEvent {
    pub nft_mint: Pubkey,
    pub owner: Pubkey,
    pub allocation: u64,
    pub nft_count: u8,
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimedEvent {
    pub nft_mint: Pubkey,
    pub claimant: Pubkey,
    pub amount: u64,
    pub total_claimed: u64,
    pub timestamp: i64,
}

#[event]
pub struct DistributedToVaultEvent {
    pub vault: Pubkey,
    pub amount: u64,
    pub total_distributed: u64,
    pub timestamp: i64,
}

#[event]
pub struct DistributionDeactivatedEvent {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AllocationDeactivatedEvent {
    pub nft_mint: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,
    #[msg("Invalid total supply (must be 63M tokens)")]
    InvalidTotalSupply,
    #[msg("Invalid start time (must be in the future)")]
    InvalidStartTime,
    #[msg("Invalid end time (must be after start time)")]
    InvalidEndTime,
    #[msg("Distribution period too short (minimum 1 day)")]
    DistributionPeriodTooShort,
    #[msg("Distribution period too long (maximum 1 year)")]
    DistributionPeriodTooLong,
    #[msg("Maximum number of special NFTs reached (25)")]
    MaxNFTsReached,
    #[msg("Invalid allocation amount")]
    InvalidAllocation,
    #[msg("Allocation exceeds total supply")]
    AllocationExceedsSupply,
    #[msg("Distribution is inactive")]
    DistributionInactive,
    #[msg("Distribution is already inactive")]
    DistributionAlreadyInactive,
    #[msg("Allocation is inactive")]
    AllocationInactive,
    #[msg("Allocation is already inactive")]
    AllocationAlreadyInactive,
    #[msg("Distribution has not started yet")]
    DistributionNotStarted,
    #[msg("No rewards available to claim")]
    NoRewardsToClaim,
    #[msg("Insufficient distribution balance")]
    InsufficientDistributionBalance,
    #[msg("Insufficient remaining supply")]
    InsufficientRemainingSupply,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Arithmetic overflow detected")]
    Overflow,
    #[msg("Arithmetic underflow detected")]
    Underflow,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Invalid distribution account")]
    InvalidDistributionAccount,
}
