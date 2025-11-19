# PANGI NFT Smart Contract Specification

## Overview

Smart contract specifications for the PANGI NFT collection with unlock system, matching pairs, and special editions.

---

## Programs Required

### 1. Main Collection Program
- **Name**: `pangi-nft-collection`
- **Purpose**: Mint pangopups and adults with unlock system
- **Features**: Matching pairs, unlock tracking, staking verification

### 2. Special Editions Program
- **Name**: `pangi-special-editions`
- **Purpose**: Mint 1-of-1 titled NFTs
- **Features**: Admin-only minting, custom metadata, governance weights

### 3. Unlock Tracker Program
- **Name**: `pangi-unlock-tracker`
- **Purpose**: Track mint progress and unlock conditions
- **Features**: Community milestone, staking verification, airdrop queue

---

## Main Collection Contract

### Account Structures

```rust
#[account]
pub struct CollectionState {
    pub authority: Pubkey,
    pub part1_minted: u16,           // Pangopups minted (0-1500)
    pub part2_minted: u16,           // Adults minted (0-1500)
    pub part2_unlocked: bool,        // Adults available?
    pub unlock_threshold: u16,       // 750 (50%)
    pub mint_price_part1: u64,       // SOL lamports
    pub mint_price_part2: u64,       // SOL lamports
    pub treasury: Pubkey,            // Revenue destination
    pub bump: u8,
}

#[account]
pub struct UnlockTracker {
    pub early_access_wallets: Vec<Pubkey>, // Stakers with early access
    pub airdrop_queue: Vec<AirdropRequest>,
    pub total_airdrops: u16,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AirdropRequest {
    pub wallet: Pubkey,
    pub pangopup_id: u16,
    pub adult_id: u16,
    pub timestamp: i64,
    pub completed: bool,
}

#[account]
pub struct StakingVerification {
    pub wallet: Pubkey,
    pub pangi_staked: u64,
    pub usd_value: u64,              // At time of stake
    pub pangopup_id: u16,
    pub adult_id: u16,
    pub verified: bool,
    pub airdrop_completed: bool,
}
```

### Instructions

#### 1. Initialize Collection

```rust
pub fn initialize_collection(
    ctx: Context<InitializeCollection>,
    mint_price_part1: u64,
    mint_price_part2: u64,
) -> Result<()> {
    let collection_state = &mut ctx.accounts.collection_state;
    
    collection_state.authority = ctx.accounts.authority.key();
    collection_state.part1_minted = 0;
    collection_state.part2_minted = 0;
    collection_state.part2_unlocked = false;
    collection_state.unlock_threshold = 750; // 50%
    collection_state.mint_price_part1 = mint_price_part1;
    collection_state.mint_price_part2 = mint_price_part2;
    collection_state.treasury = ctx.accounts.treasury.key();
    collection_state.bump = ctx.bumps.collection_state;
    
    Ok(())
}
```

#### 2. Mint Pangopup (Part 1)

```rust
pub fn mint_pangopup(
    ctx: Context<MintPangopup>,
) -> Result<()> {
    let collection_state = &mut ctx.accounts.collection_state;
    
    // Check supply
    require!(
        collection_state.part1_minted < 1500,
        ErrorCode::Part1SoldOut
    );
    
    // Transfer payment
    transfer_sol(
        &ctx.accounts.minter,
        &ctx.accounts.treasury,
        collection_state.mint_price_part1,
    )?;
    
    // Mint NFT
    let pangopup_id = collection_state.part1_minted + 1;
    mint_nft(
        &ctx.accounts.minter.key(),
        pangopup_id,
        "Pangopup",
    )?;
    
    // Update counter
    collection_state.part1_minted += 1;
    
    // Check unlock threshold
    if collection_state.part1_minted >= collection_state.unlock_threshold {
        collection_state.part2_unlocked = true;
        
        emit!(CommunityUnlockEvent {
            total_minted: collection_state.part1_minted,
            timestamp: Clock::get()?.unix_timestamp,
        });
    }
    
    emit!(PangopupMintedEvent {
        minter: ctx.accounts.minter.key(),
        pangopup_id,
        matching_adult_id: pangopup_id + 1500,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

#### 3. Verify Staking for Early Access

```rust
pub fn verify_staking_unlock(
    ctx: Context<VerifyStaking>,
    pangopup_id: u16,
) -> Result<()> {
    let stake_position = &ctx.accounts.stake_position;
    let collection_state = &ctx.accounts.collection_state;
    let verification = &mut ctx.accounts.verification;
    
    // Verify user owns pangopup
    require!(
        owns_pangopup(&ctx.accounts.minter.key(), pangopup_id)?,
        ErrorCode::DoesNotOwnPangopup
    );
    
    // Get PANGI price from oracle
    let pangi_price = get_pangi_price_usd()?;
    
    // Calculate USD value
    let usd_value = (stake_position.amount as u128)
        .checked_mul(pangi_price as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(1_000_000_000) // 9 decimals
        .ok_or(ErrorCode::DivisionByZero)? as u64;
    
    // Verify $100 USD minimum
    require!(
        usd_value >= 100_000_000, // $100 in micro-dollars
        ErrorCode::InsufficientStakeValue
    );
    
    // Calculate matching adult ID
    let adult_id = pangopup_id + 1500;
    
    // Record verification
    verification.wallet = ctx.accounts.minter.key();
    verification.pangi_staked = stake_position.amount;
    verification.usd_value = usd_value;
    verification.pangopup_id = pangopup_id;
    verification.adult_id = adult_id;
    verification.verified = true;
    verification.airdrop_completed = false;
    
    // Add to airdrop queue
    let unlock_tracker = &mut ctx.accounts.unlock_tracker;
    unlock_tracker.airdrop_queue.push(AirdropRequest {
        wallet: ctx.accounts.minter.key(),
        pangopup_id,
        adult_id,
        timestamp: Clock::get()?.unix_timestamp,
        completed: false,
    });
    
    unlock_tracker.early_access_wallets.push(ctx.accounts.minter.key());
    
    emit!(StakingVerifiedEvent {
        wallet: ctx.accounts.minter.key(),
        pangopup_id,
        adult_id,
        pangi_staked: stake_position.amount,
        usd_value,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

#### 4. Execute Airdrop (Admin)

```rust
pub fn execute_airdrop(
    ctx: Context<ExecuteAirdrop>,
    airdrop_index: usize,
) -> Result<()> {
    let unlock_tracker = &mut ctx.accounts.unlock_tracker;
    let verification = &mut ctx.accounts.verification;
    
    // Verify admin
    require!(
        ctx.accounts.authority.key() == ctx.accounts.collection_state.authority,
        ErrorCode::Unauthorized
    );
    
    // Get airdrop request
    let airdrop = &mut unlock_tracker.airdrop_queue[airdrop_index];
    
    require!(
        !airdrop.completed,
        ErrorCode::AirdropAlreadyCompleted
    );
    
    // Mint adult NFT to wallet
    mint_nft(
        &airdrop.wallet,
        airdrop.adult_id,
        "Adult",
    )?;
    
    // Mark completed
    airdrop.completed = true;
    verification.airdrop_completed = true;
    unlock_tracker.total_airdrops += 1;
    
    emit!(AirdropCompletedEvent {
        wallet: airdrop.wallet,
        pangopup_id: airdrop.pangopup_id,
        adult_id: airdrop.adult_id,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

#### 5. Mint Adult (Part 2)

```rust
pub fn mint_adult(
    ctx: Context<MintAdult>,
) -> Result<()> {
    let collection_state = &mut ctx.accounts.collection_state;
    
    // Check if Part 2 is unlocked
    require!(
        collection_state.part2_unlocked,
        ErrorCode::Part2Locked
    );
    
    // Check supply
    require!(
        collection_state.part2_minted < 1500,
        ErrorCode::Part2SoldOut
    );
    
    // Transfer payment
    transfer_sol(
        &ctx.accounts.minter,
        &ctx.accounts.treasury,
        collection_state.mint_price_part2,
    )?;
    
    // Mint NFT
    let adult_id = collection_state.part2_minted + 1501;
    mint_nft(
        &ctx.accounts.minter.key(),
        adult_id,
        "Adult",
    )?;
    
    // Update counter
    collection_state.part2_minted += 1;
    
    emit!(AdultMintedEvent {
        minter: ctx.accounts.minter.key(),
        adult_id,
        matching_pangopup_id: adult_id - 1500,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

---

## Special Editions Contract

### Account Structures

```rust
#[account]
pub struct SpecialEditionState {
    pub authority: Pubkey,
    pub total_minted: u16,
    pub titles_registry: Vec<TitleRecord>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TitleRecord {
    pub title: String,
    pub category: TitleCategory,
    pub stage: Stage,
    pub governance_weight: u32,
    pub staking_multiplier: u16,
    pub minted: bool,
    pub owner: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TitleCategory {
    RoyalCourt,
    GalacticSenate,
    JediOrder,
    SithEmpire,
    MilitaryCommand,
    MysticOrder,
    Underworld,
    ArtisanGuild,
    ExplorerLeague,
    TechSyndicate,
    Hybrid,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum Stage {
    Pangopup,
    Adult,
}
```

### Instructions

#### 1. Mint Special Edition (Admin Only)

```rust
pub fn mint_special_edition(
    ctx: Context<MintSpecialEdition>,
    title: String,
    category: TitleCategory,
    stage: Stage,
    governance_weight: u32,
    staking_multiplier: u16,
    metadata_uri: String,
) -> Result<()> {
    let special_state = &mut ctx.accounts.special_state;
    
    // Verify admin
    require!(
        ctx.accounts.authority.key() == special_state.authority,
        ErrorCode::Unauthorized
    );
    
    // Check if title already exists
    require!(
        !title_exists(&special_state.titles_registry, &title),
        ErrorCode::TitleAlreadyExists
    );
    
    // Mint 1-of-1 NFT
    let nft_id = special_state.total_minted + 1;
    mint_special_nft(
        &ctx.accounts.recipient.key(),
        nft_id,
        &title,
        &metadata_uri,
    )?;
    
    // Record title
    special_state.titles_registry.push(TitleRecord {
        title: title.clone(),
        category,
        stage,
        governance_weight,
        staking_multiplier,
        minted: true,
        owner: Some(ctx.accounts.recipient.key()),
    });
    
    special_state.total_minted += 1;
    
    emit!(SpecialEditionMintedEvent {
        recipient: ctx.accounts.recipient.key(),
        nft_id,
        title,
        category,
        stage,
        governance_weight,
        staking_multiplier,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

---

## Events

```rust
#[event]
pub struct PangopupMintedEvent {
    pub minter: Pubkey,
    pub pangopup_id: u16,
    pub matching_adult_id: u16,
    pub timestamp: i64,
}

#[event]
pub struct AdultMintedEvent {
    pub minter: Pubkey,
    pub adult_id: u16,
    pub matching_pangopup_id: u16,
    pub timestamp: i64,
}

#[event]
pub struct CommunityUnlockEvent {
    pub total_minted: u16,
    pub timestamp: i64,
}

#[event]
pub struct StakingVerifiedEvent {
    pub wallet: Pubkey,
    pub pangopup_id: u16,
    pub adult_id: u16,
    pub pangi_staked: u64,
    pub usd_value: u64,
    pub timestamp: i64,
}

#[event]
pub struct AirdropCompletedEvent {
    pub wallet: Pubkey,
    pub pangopup_id: u16,
    pub adult_id: u16,
    pub timestamp: i64,
}

#[event]
pub struct SpecialEditionMintedEvent {
    pub recipient: Pubkey,
    pub nft_id: u16,
    pub title: String,
    pub category: TitleCategory,
    pub stage: Stage,
    pub governance_weight: u32,
    pub staking_multiplier: u16,
    pub timestamp: i64,
}
```

---

## Error Codes

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Part 1 (Pangopups) is sold out")]
    Part1SoldOut,
    
    #[msg("Part 2 (Adults) is sold out")]
    Part2SoldOut,
    
    #[msg("Part 2 (Adults) is locked. Wait for 50% mint or stake $100")]
    Part2Locked,
    
    #[msg("Wallet does not own this pangopup")]
    DoesNotOwnPangopup,
    
    #[msg("Insufficient stake value. Need $100 USD worth of PANGI")]
    InsufficientStakeValue,
    
    #[msg("Airdrop already completed")]
    AirdropAlreadyCompleted,
    
    #[msg("Title already exists")]
    TitleAlreadyExists,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Arithmetic overflow")]
    Overflow,
    
    #[msg("Division by zero")]
    DivisionByZero,
}
```

---

## Helper Functions

```rust
// Check if wallet owns pangopup
fn owns_pangopup(wallet: &Pubkey, pangopup_id: u16) -> Result<bool> {
    // Query NFT ownership from Metaplex
    // Implementation depends on Metaplex integration
    Ok(true) // Placeholder
}

// Get PANGI price in USD from oracle
fn get_pangi_price_usd() -> Result<u64> {
    // Query Pyth or Switchboard oracle
    // Return price in micro-dollars (6 decimals)
    Ok(10_000) // Placeholder: $0.01 USD
}

// Check if title exists
fn title_exists(registry: &Vec<TitleRecord>, title: &str) -> bool {
    registry.iter().any(|t| t.title == title)
}
```

---

## Integration with Staking Program

### Cross-Program Invocation

```rust
// In unlock verification, call staking program
pub fn verify_stake_position(
    stake_program: &AccountInfo,
    stake_position: &AccountInfo,
    user: &Pubkey,
) -> Result<u64> {
    // CPI to staking program to verify position
    let cpi_accounts = GetStakePosition {
        stake_position: stake_position.clone(),
        user: user.clone(),
    };
    
    let cpi_ctx = CpiContext::new(
        stake_program.clone(),
        cpi_accounts,
    );
    
    let stake_amount = pangi_staking::cpi::get_stake_amount(cpi_ctx)?;
    
    Ok(stake_amount)
}
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Audit smart contracts
- [ ] Test on devnet
- [ ] Verify oracle integration
- [ ] Test airdrop mechanism
- [ ] Verify matching pair logic
- [ ] Test unlock threshold
- [ ] Verify payment flows

### Deployment
- [ ] Deploy to mainnet
- [ ] Initialize collection state
- [ ] Set mint prices
- [ ] Configure treasury
- [ ] Set up oracle feeds
- [ ] Deploy special editions program
- [ ] Verify all PDAs

### Post-Deployment
- [ ] Monitor mint progress
- [ ] Track unlock threshold
- [ ] Process airdrops
- [ ] Monitor staking verifications
- [ ] Track special edition mints

---

## Security Considerations

1. **Admin Keys**: Use multisig for authority
2. **Oracle Reliability**: Multiple price feeds
3. **Airdrop Queue**: Rate limiting to prevent spam
4. **Payment Verification**: Double-check SOL transfers
5. **Supply Limits**: Hard-coded max supply
6. **Reentrancy**: Use Anchor's built-in protection
7. **Integer Overflow**: Use checked math everywhere

---

## Gas Optimization

1. Use PDAs efficiently
2. Minimize account size
3. Batch airdrops when possible
4. Optimize event emissions
5. Use compact data structures

---

## Future Upgrades

1. **Breeding**: Pair holders can breed new NFTs
2. **Trait Modification**: Artisan Guild NFTs enable changes
3. **Staking Directly**: NFT staking for rewards
4. **Governance**: Title-weighted voting
5. **Cross-Chain**: Bridge to other chains
