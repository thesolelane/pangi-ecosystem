use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE");

// Security constants
const MIN_EVOLUTION_COOLDOWN: i64 = 60; // 1 minute minimum
const MAX_EVOLUTION_COOLDOWN: i64 = 30 * 24 * 60 * 60; // 30 days maximum
const MAX_EVOLUTION_COUNT: u32 = 100; // Prevent infinite evolution
const MAX_GENERATION: u16 = 1000; // Maximum generation number
const MAX_TOTAL_NFTS: u64 = 10000; // ✅ ADD: Maximum total NFTs that can be minted

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

#[program]
pub mod pangi_nft {
    use super::*;

    pub fn initialize_global_config(ctx: Context<InitializeGlobalConfig>) -> Result<()> {
        let config = &mut ctx.accounts.global_config;
        config.authority = ctx.accounts.authority.key();
        config.total_minted = 0;
        config.max_supply = MAX_TOTAL_NFTS;
        config.mint_paused = false;
        
        emit!(GlobalConfigInitializedEvent {
            authority: config.authority,
            max_supply: config.max_supply,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    pub fn initialize_hatchling(
        ctx: Context<InitializeHatchling>,
        evolution_cooldown: i64,
        series: u8,
        matching_nft_id: u16,
        is_special_edition: bool,
    ) -> Result<()> {
        let global_config = &mut ctx.accounts.global_config;
        
        // ✅ CHECK MINT NOT PAUSED
        require!(!global_config.mint_paused, ErrorCode::MintPaused);
        
        // ✅ CHECK MAX SUPPLY NOT REACHED
        require!(
            global_config.total_minted < global_config.max_supply,
            ErrorCode::MaxSupplyReached
        );
        
        // ✅ INCREMENT MINT COUNTER
        global_config.total_minted = global_config
            .total_minted
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        
        // Input validation
        require!(
            evolution_cooldown >= MIN_EVOLUTION_COOLDOWN,
            ErrorCode::CooldownTooShort
        );
        require!(
            evolution_cooldown <= MAX_EVOLUTION_COOLDOWN,
            ErrorCode::CooldownTooLong
        );

        // Verify NFT mint is valid
        require!(
            ctx.accounts.nft_mint.supply == 1,
            ErrorCode::InvalidNFTMint
        );
        require!(
            ctx.accounts.nft_mint.decimals == 0,
            ErrorCode::InvalidNFTMint
        );

        let hatchling = &mut ctx.accounts.hatchling;
        let clock = Clock::get()?;
        
        // Validate series
        require!(series == 1 || series == 2, ErrorCode::InvalidSeries);
        
        // For Series 1 (Main Collection), validate matching ID ranges
        if series == 1 && !is_special_edition {
            let nft_id = global_config.total_minted as u16;
            if nft_id <= 1500 {
                // Hatchling: matching_nft_id should be in adult range (1501-3000)
                require!(
                    matching_nft_id > 1500 && matching_nft_id <= 3000,
                    ErrorCode::InvalidMatchingId
                );
            } else {
                // Adult: matching_nft_id should be in hatchling range (1-1500)
                require!(
                    matching_nft_id >= 1 && matching_nft_id <= 1500,
                    ErrorCode::InvalidMatchingId
                );
            }
        }
        
        hatchling.nft_mint = ctx.accounts.nft_mint.key();
        hatchling.authority = ctx.accounts.authority.key();
        hatchling.stage = LifeStage::Hatchling; // Default to Hatchling for Series 1
        hatchling.rarity = Rarity::Common;
        hatchling.evolution_count = 0;
        hatchling.last_evolution_timestamp = clock.unix_timestamp;
        hatchling.evolution_cooldown = evolution_cooldown;
        hatchling.traits = TraitSet::default();
        hatchling.generation = 1;
        hatchling.is_locked = false;
        hatchling.series = series;
        hatchling.matching_nft_id = matching_nft_id;
        hatchling.is_special_edition = is_special_edition;

        emit!(HatchlingInitializedEvent {
            nft_mint: hatchling.nft_mint,
            authority: hatchling.authority,
            evolution_cooldown,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    pub fn evolve_hatchling(ctx: Context<EvolveHatchling>) -> Result<()> {
        let hatchling = &mut ctx.accounts.hatchling;
        let clock = Clock::get()?;
        
        // Validate authority
        require!(
            ctx.accounts.authority.key() == hatchling.authority,
            ErrorCode::Unauthorized
        );

        // Check if locked (e.g., staked in vault)
        require!(!hatchling.is_locked, ErrorCode::HatchlingLocked);

        // Validate evolution stage
        require!(
            hatchling.stage != LifeStage::Legendary,
            ErrorCode::MaxEvolutionReached
        );

        // Check evolution count limit
        require!(
            hatchling.evolution_count < MAX_EVOLUTION_COUNT,
            ErrorCode::MaxEvolutionCountReached
        );
        
        // Check cooldown with overflow protection
        let time_since_last = clock
            .unix_timestamp
            .checked_sub(hatchling.last_evolution_timestamp)
            .ok_or(ErrorCode::Overflow)?;

        require!(
            time_since_last >= hatchling.evolution_cooldown,
            ErrorCode::EvolutionCooldownActive
        );

        // Store old stage for event
        let old_stage = hatchling.stage;

        // Evolve based on current stage and series
        if hatchling.is_special_edition {
            // Special editions can evolve through all stages
            match hatchling.stage {
                LifeStage::Egg => {
                    hatchling.stage = LifeStage::Hatchling;
                    hatchling.rarity = calculate_rarity(&ctx.accounts.authority.key(), clock.unix_timestamp)?;
                    hatchling.traits = generate_initial_traits(hatchling.rarity)?;
                }
                LifeStage::Hatchling => {
                    hatchling.stage = LifeStage::Juvenile;
                    hatchling.traits = evolve_traits(&hatchling.traits, hatchling.rarity, 1)?;
                }
                LifeStage::Juvenile => {
                    hatchling.stage = LifeStage::Adult;
                    hatchling.traits = evolve_traits(&hatchling.traits, hatchling.rarity, 2)?;
                }
                LifeStage::Adult => {
                    hatchling.stage = LifeStage::Legendary;
                    hatchling.rarity = upgrade_rarity(hatchling.rarity)?;
                    hatchling.traits = evolve_traits(&hatchling.traits, hatchling.rarity, 3)?;
                }
                LifeStage::Legendary => {
                    return Err(ErrorCode::MaxEvolutionReached.into());
                }
            }
        } else {
            // Series 1 Main Collection: Hatchling → Adult only (no evolution, separate mints)
            return Err(ErrorCode::MainCollectionNoEvolution.into());
        }

        hatchling.last_evolution_timestamp = clock.unix_timestamp;
        hatchling.evolution_count = hatchling
            .evolution_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        emit!(EvolutionEvent {
            nft_mint: hatchling.nft_mint,
            old_stage,
            new_stage: hatchling.stage,
            evolved_by: ctx.accounts.authority.key(),
            timestamp: clock.unix_timestamp,
            traits: hatchling.traits,
            evolution_count: hatchling.evolution_count,
        });

        Ok(())
    }

    pub fn lock_hatchling(ctx: Context<LockHatchling>) -> Result<()> {
        let hatchling = &mut ctx.accounts.hatchling;

        require!(
            ctx.accounts.authority.key() == hatchling.authority,
            ErrorCode::Unauthorized
        );

        require!(!hatchling.is_locked, ErrorCode::AlreadyLocked);

        hatchling.is_locked = true;

        emit!(HatchlingLockedEvent {
            nft_mint: hatchling.nft_mint,
            locked_by: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn unlock_hatchling(ctx: Context<UnlockHatchling>) -> Result<()> {
        let hatchling = &mut ctx.accounts.hatchling;

        require!(
            ctx.accounts.authority.key() == hatchling.authority,
            ErrorCode::Unauthorized
        );

        require!(hatchling.is_locked, ErrorCode::NotLocked);

        hatchling.is_locked = false;

        emit!(HatchlingUnlockedEvent {
            nft_mint: hatchling.nft_mint,
            unlocked_by: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Helper functions with deterministic randomness
fn calculate_rarity(authority: &Pubkey, timestamp: i64) -> Result<Rarity> {
    // Use authority pubkey and timestamp for pseudo-randomness
    let seed = authority.to_bytes()[0] as u64 + timestamp as u64;
    let random = seed % 100;

    let rarity = match random {
        0..=49 => Rarity::Common,      // 50%
        50..=74 => Rarity::Uncommon,   // 25%
        75..=89 => Rarity::Rare,       // 15%
        90..=97 => Rarity::Epic,       // 8%
        98..=99 => Rarity::Legendary,  // 2%
        _ => Rarity::Common,
    };

    Ok(rarity)
}

fn generate_initial_traits(rarity: Rarity) -> Result<TraitSet> {
    let base_stats = match rarity {
        Rarity::Common => (10, 10, 10),
        Rarity::Uncommon => (15, 15, 15),
        Rarity::Rare => (20, 20, 20),
        Rarity::Epic => (30, 30, 30),
        Rarity::Legendary => (50, 50, 50),
    };

    Ok(TraitSet {
        strength: base_stats.0,
        agility: base_stats.1,
        intelligence: base_stats.2,
        special_ability: 0,
    })
}

fn evolve_traits(current: &TraitSet, rarity: Rarity, evolution_level: u8) -> Result<TraitSet> {
    let multiplier = match rarity {
        Rarity::Common => 1,
        Rarity::Uncommon => 2,
        Rarity::Rare => 3,
        Rarity::Epic => 4,
        Rarity::Legendary => 5,
    };

    let boost = (evolution_level as u16) * multiplier * 5;

    Ok(TraitSet {
        strength: current.strength.saturating_add(boost),
        agility: current.agility.saturating_add(boost),
        intelligence: current.intelligence.saturating_add(boost),
        special_ability: current.special_ability.saturating_add(evolution_level as u16),
    })
}

fn upgrade_rarity(current: Rarity) -> Result<Rarity> {
    let upgraded = match current {
        Rarity::Common => Rarity::Uncommon,
        Rarity::Uncommon => Rarity::Rare,
        Rarity::Rare => Rarity::Epic,
        Rarity::Epic => Rarity::Legendary,
        Rarity::Legendary => Rarity::Legendary, // Already max
    };
    Ok(upgraded)
}

#[derive(Accounts)]
pub struct InitializeGlobalConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GlobalConfig::INIT_SPACE,
        seeds = [b"global_config"],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeHatchling<'info> {
    #[account(
        mut,
        seeds = [b"global_config"],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(
        init,
        payer = authority,
        space = 8 + Hatchling::INIT_SPACE,
        seeds = [b"hatchling", nft_mint.key().as_ref()],
        bump
    )]
    pub hatchling: Account<'info, Hatchling>,
    pub nft_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EvolveHatchling<'info> {
    #[account(
        mut,
        seeds = [b"hatchling", hatchling.nft_mint.as_ref()],
        bump
    )]
    pub hatchling: Account<'info, Hatchling>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct LockHatchling<'info> {
    #[account(
        mut,
        seeds = [b"hatchling", hatchling.nft_mint.as_ref()],
        bump
    )]
    pub hatchling: Account<'info, Hatchling>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnlockHatchling<'info> {
    #[account(
        mut,
        seeds = [b"hatchling", hatchling.nft_mint.as_ref()],
        bump
    )]
    pub hatchling: Account<'info, Hatchling>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub total_minted: u64,
    pub max_supply: u64,
    pub mint_paused: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Hatchling {
    pub nft_mint: Pubkey,
    pub authority: Pubkey,
    pub stage: LifeStage,
    pub rarity: Rarity,
    pub evolution_count: u32,
    pub last_evolution_timestamp: i64,
    pub evolution_cooldown: i64,
    pub traits: TraitSet,
    pub generation: u16,
    pub is_locked: bool,
    pub series: u8,              // 1 = Main Collection, 2 = Special Edition
    pub matching_nft_id: u16,    // For Series 1: Hatchling #1 ↔ Adult #1501
    pub is_special_edition: bool, // True for promotional NFTs
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum LifeStage {
    Hatchling,  // Series 1 Part 1 (1500 NFTs)
    Adult,      // Series 1 Part 2 (1500 NFTs)
    // Special Editions only:
    Egg,        // Promotional
    Juvenile,   // Promotional
    Legendary,  // Promotional/1-of-1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, InitSpace)]
pub struct TraitSet {
    pub strength: u16,
    pub agility: u16,
    pub intelligence: u16,
    pub special_ability: u16,
}

#[event]
pub struct GlobalConfigInitializedEvent {
    pub authority: Pubkey,
    pub max_supply: u64,
    pub timestamp: i64,
}

#[event]
pub struct HatchlingInitializedEvent {
    pub nft_mint: Pubkey,
    pub authority: Pubkey,
    pub evolution_cooldown: i64,
    pub timestamp: i64,
}

#[event]
pub struct EvolutionEvent {
    pub nft_mint: Pubkey,
    pub old_stage: LifeStage,
    pub new_stage: LifeStage,
    pub evolved_by: Pubkey,
    pub timestamp: i64,
    pub traits: TraitSet,
    pub evolution_count: u32,
}

#[event]
pub struct HatchlingLockedEvent {
    pub nft_mint: Pubkey,
    pub locked_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct HatchlingUnlockedEvent {
    pub nft_mint: Pubkey,
    pub unlocked_by: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid evolution stage for this operation")]
    InvalidEvolutionStage,
    #[msg("Evolution cooldown period is still active")]
    EvolutionCooldownActive,
    #[msg("Maximum evolution stage already reached")]
    MaxEvolutionReached,
    #[msg("Cooldown period too short (minimum 1 minute)")]
    CooldownTooShort,
    #[msg("Cooldown period too long (maximum 30 days)")]
    CooldownTooLong,
    #[msg("Invalid NFT mint (must be supply=1, decimals=0)")]
    InvalidNFTMint,
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,
    #[msg("Arithmetic overflow detected")]
    Overflow,
    #[msg("Maximum evolution count reached")]
    MaxEvolutionCountReached,
    #[msg("Hatchling is locked (possibly staked)")]
    HatchlingLocked,
    #[msg("Hatchling is not locked")]
    NotLocked,
    #[msg("Hatchling is already locked")]
    AlreadyLocked,
    #[msg("Maximum NFT supply reached")]
    MaxSupplyReached,
    #[msg("Minting is currently paused")]
    MintPaused,
    #[msg("Arithmetic underflow detected")]
    Underflow,
    #[msg("Division by zero")]
    DivisionByZero,
    #[msg("Invalid series number (must be 1 or 2)")]
    InvalidSeries,
    #[msg("Invalid matching NFT ID for this series")]
    InvalidMatchingId,
    #[msg("Main collection NFTs cannot evolve (Hatchling and Adult are separate mints)")]
    MainCollectionNoEvolution,
}
