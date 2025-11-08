# Program Reference

Complete API reference for all PANGI Solana programs.

## Program IDs (Devnet)

```
Token Program:        BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
Vault Program:        5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
NFT Program:          etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
Distribution Program: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq
```

---

## Token Program

### Overview

SPL Token with dynamic tax system for PANGI token transfers.

### Instructions

#### `initialize`

Initialize the tax configuration for the token program.

**Accounts:**
```rust
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + TaxConfig::LEN
    )]
    pub tax_config: Account<'info, TaxConfig>,
    
    pub system_program: Program<'info, System>,
}
```

**Arguments:**
```rust
pub struct InitializeArgs {
    pub tax_rate: u16,              // Basis points (e.g., 200 = 2%)
    pub conservation_fund: Pubkey,
    pub liquidity_pool: Pubkey,
    pub treasury: Pubkey,
}
```

**Example:**
```typescript
const tx = await program.methods
  .initialize({
    taxRate: 200,  // 2%
    conservationFund: conservationWallet.publicKey,
    liquidityPool: lpWallet.publicKey,
    treasury: treasuryWallet.publicKey,
  })
  .accounts({
    authority: authority.publicKey,
    taxConfig: taxConfigPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### `update_tax_config`

Update tax configuration parameters.

**Accounts:**
```rust
pub struct UpdateTaxConfig<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority
    )]
    pub tax_config: Account<'info, TaxConfig>,
}
```

**Arguments:**
```rust
pub struct UpdateTaxConfigArgs {
    pub tax_rate: Option<u16>,
    pub conservation_fund: Option<Pubkey>,
    pub liquidity_pool: Option<Pubkey>,
    pub treasury: Option<Pubkey>,
}
```

**Example:**
```typescript
const tx = await program.methods
  .updateTaxConfig({
    taxRate: 300,  // Update to 3%
    conservationFund: null,
    liquidityPool: null,
    treasury: null,
  })
  .accounts({
    authority: authority.publicKey,
    taxConfig: taxConfigPDA,
  })
  .rpc();
```

#### `transfer_with_tax`

Transfer tokens with automatic tax deduction.

**Accounts:**
```rust
pub struct TransferWithTax<'info> {
    pub from: Signer<'info>,
    
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub conservation_fund_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub liquidity_pool_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_account: Account<'info, TokenAccount>,
    
    pub tax_config: Account<'info, TaxConfig>,
    pub token_program: Program<'info, Token>,
}
```

**Arguments:**
```rust
pub struct TransferWithTaxArgs {
    pub amount: u64,  // Amount before tax
}
```

**Tax Calculation:**
```
Tax Amount = amount * (tax_rate / 10000)
Net Amount = amount - Tax Amount

Tax Distribution:
- Conservation Fund: Tax Amount * 50%
- Liquidity Pool:    Tax Amount * 30%
- Treasury:          Tax Amount * 20%
```

**Example:**
```typescript
const amount = 1000 * 10**9;  // 1000 PANGI

const tx = await program.methods
  .transferWithTax({ amount })
  .accounts({
    from: sender.publicKey,
    fromTokenAccount: senderTokenAccount,
    toTokenAccount: recipientTokenAccount,
    conservationFundAccount: conservationTokenAccount,
    liquidityPoolAccount: lpTokenAccount,
    treasuryAccount: treasuryTokenAccount,
    taxConfig: taxConfigPDA,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### Account Structures

#### `TaxConfig`

```rust
pub struct TaxConfig {
    pub authority: Pubkey,           // 32 bytes
    pub tax_rate: u16,               // 2 bytes (basis points)
    pub conservation_fund: Pubkey,   // 32 bytes
    pub liquidity_pool: Pubkey,      // 32 bytes
    pub treasury: Pubkey,            // 32 bytes
}
// Total: 130 bytes
```

### Errors

```rust
pub enum ErrorCode {
    #[msg("Tax rate exceeds maximum (500 basis points = 5%)")]
    TaxRateTooHigh,
    
    #[msg("Insufficient balance for transfer")]
    InsufficientBalance,
    
    #[msg("Unauthorized: Only authority can update config")]
    Unauthorized,
}
```

---

## NFT Program

### Overview

Dynamic NFT system with 5-tier evolution mechanics.

### Instructions

#### `mint_nft`

Mint a new PANGI NFT (starts at Egg tier).

**Accounts:**
```rust
pub struct MintNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub mint: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + PangiNFT::LEN,
        seeds = [b"nft", mint.key().as_ref()],
        bump
    )]
    pub nft_account: Account<'info, PangiNFT>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

**Arguments:**
```rust
pub struct MintNFTArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
```

**Example:**
```typescript
const mint = Keypair.generate();

const tx = await program.methods
  .mintNft({
    name: "PANGI #1",
    symbol: "PANGI",
    uri: "https://arweave.net/...",
  })
  .accounts({
    payer: payer.publicKey,
    mint: mint.publicKey,
    nftAccount: nftAccountPDA,
    tokenAccount: userTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .signers([mint])
  .rpc();
```

#### `evolve`

Evolve NFT to the next tier.

**Accounts:**
```rust
pub struct Evolve<'info> {
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        has_one = owner,
        constraint = nft_account.can_evolve() @ ErrorCode::InsufficientEvolutionPoints
    )]
    pub nft_account: Account<'info, PangiNFT>,
}
```

**Evolution Requirements:**
```rust
Egg → Baby:      100 points
Baby → Juvenile: 500 points
Juvenile → Adult: 2,000 points
Adult → Legendary: 10,000 points
```

**Example:**
```typescript
const tx = await program.methods
  .evolve()
  .accounts({
    owner: owner.publicKey,
    nftAccount: nftAccountPDA,
  })
  .rpc();
```

#### `add_evolution_points`

Add evolution points to an NFT (called by Vault Program).

**Accounts:**
```rust
pub struct AddEvolutionPoints<'info> {
    pub vault_program: Signer<'info>,  // CPI from Vault
    
    #[account(mut)]
    pub nft_account: Account<'info, PangiNFT>,
}
```

**Arguments:**
```rust
pub struct AddEvolutionPointsArgs {
    pub points: u64,
}
```

**Example (CPI from Vault):**
```rust
let cpi_accounts = AddEvolutionPoints {
    vault_program: ctx.accounts.vault_authority.to_account_info(),
    nft_account: ctx.accounts.nft_account.to_account_info(),
};
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.nft_program.to_account_info(),
    cpi_accounts,
    signer_seeds,
);
nft_program::cpi::add_evolution_points(cpi_ctx, points)?;
```

### Account Structures

#### `PangiNFT`

```rust
pub struct PangiNFT {
    pub owner: Pubkey,              // 32 bytes
    pub mint: Pubkey,               // 32 bytes
    pub tier: EvolutionTier,        // 1 byte
    pub evolution_points: u64,      // 8 bytes
    pub created_at: i64,            // 8 bytes
    pub last_evolved: i64,          // 8 bytes
    pub bump: u8,                   // 1 byte
}
// Total: 90 bytes

pub enum EvolutionTier {
    Egg = 0,
    Baby = 1,
    Juvenile = 2,
    Adult = 3,
    Legendary = 4,
}
```

### Errors

```rust
pub enum ErrorCode {
    #[msg("Insufficient evolution points to evolve")]
    InsufficientEvolutionPoints,
    
    #[msg("NFT is already at maximum tier")]
    AlreadyMaxTier,
    
    #[msg("Unauthorized: Not NFT owner")]
    NotOwner,
}
```

---

## Vault Program

### Overview

NFT staking system with token rewards and evolution points.

### Instructions

#### `create_vault`

Create a new staking vault.

**Accounts:**
```rust
pub struct CreateVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    pub reward_pool: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}
```

**Arguments:**
```rust
pub struct CreateVaultArgs {
    pub reward_rate: u64,      // Tokens per second
    pub evolution_rate: u64,   // Points per second
}
```

**Example:**
```typescript
const tx = await program.methods
  .createVault({
    rewardRate: new BN(1_000_000),  // 0.001 PANGI/sec
    evolutionRate: new BN(1),        // 1 point/sec
  })
  .accounts({
    authority: authority.publicKey,
    vault: vaultPDA,
    rewardPool: rewardPoolAccount,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### `stake_nft`

Stake an NFT in a vault.

**Accounts:**
```rust
pub struct StakeNFT<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + StakeAccount::LEN,
        seeds = [b"stake", vault.key().as_ref(), nft_mint.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    pub nft_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_nft_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

**Example:**
```typescript
const tx = await program.methods
  .stakeNft()
  .accounts({
    owner: owner.publicKey,
    vault: vaultPDA,
    stakeAccount: stakeAccountPDA,
    nftMint: nftMint.publicKey,
    nftTokenAccount: ownerNftAccount,
    vaultNftAccount: vaultNftAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### `unstake_nft`

Unstake an NFT from a vault.

**Accounts:**
```rust
pub struct UnstakeNFT<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        close = owner,
        has_one = owner,
        has_one = vault
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_nft_account: Account<'info, TokenAccount>,
    
    pub vault_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}
```

**Example:**
```typescript
const tx = await program.methods
  .unstakeNft()
  .accounts({
    owner: owner.publicKey,
    vault: vaultPDA,
    stakeAccount: stakeAccountPDA,
    nftTokenAccount: ownerNftAccount,
    vaultNftAccount: vaultNftAccount,
    vaultAuthority: vaultAuthorityPDA,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

#### `claim_rewards`

Claim accumulated token rewards.

**Accounts:**
```rust
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        has_one = owner,
        has_one = vault
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(mut)]
    pub reward_pool: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub vault_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}
```

**Reward Calculation:**
```rust
let time_staked = current_time - stake_account.last_claim;
let rewards = time_staked * vault.reward_rate;
```

**Example:**
```typescript
const tx = await program.methods
  .claimRewards()
  .accounts({
    owner: owner.publicKey,
    vault: vaultPDA,
    stakeAccount: stakeAccountPDA,
    rewardPool: vaultRewardPool,
    userTokenAccount: userTokenAccount,
    vaultAuthority: vaultAuthorityPDA,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### Account Structures

#### `Vault`

```rust
pub struct Vault {
    pub authority: Pubkey,      // 32 bytes
    pub reward_rate: u64,       // 8 bytes
    pub evolution_rate: u64,    // 8 bytes
    pub total_staked: u64,      // 8 bytes
    pub reward_pool: Pubkey,    // 32 bytes
    pub bump: u8,               // 1 byte
}
// Total: 89 bytes
```

#### `StakeAccount`

```rust
pub struct StakeAccount {
    pub owner: Pubkey,              // 32 bytes
    pub nft_mint: Pubkey,           // 32 bytes
    pub vault: Pubkey,              // 32 bytes
    pub staked_at: i64,             // 8 bytes
    pub last_claim: i64,            // 8 bytes
    pub accumulated_rewards: u64,   // 8 bytes
    pub accumulated_points: u64,    // 8 bytes
    pub bump: u8,                   // 1 byte
}
// Total: 129 bytes
```

### Errors

```rust
pub enum ErrorCode {
    #[msg("NFT is not owned by the user")]
    NotNFTOwner,
    
    #[msg("Insufficient rewards in pool")]
    InsufficientRewards,
    
    #[msg("NFT is not staked")]
    NotStaked,
}
```

---

## Distribution Program

### Overview

Manages 63M PANGI distribution across 25 special NFTs.

### Instructions

#### `initialize_distribution`

Set up the distribution configuration.

**Accounts:**
```rust
pub struct InitializeDistribution<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + DistributionConfig::LEN
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    
    pub system_program: Program<'info, System>,
}
```

**Arguments:**
```rust
pub struct InitializeDistributionArgs {
    pub total_allocation: u64,  // 63,000,000 * 10^9
}
```

**Example:**
```typescript
const TOTAL_ALLOCATION = new BN(63_000_000).mul(new BN(10).pow(new BN(9)));

const tx = await program.methods
  .initializeDistribution({
    totalAllocation: TOTAL_ALLOCATION,
  })
  .accounts({
    authority: authority.publicKey,
    distributionConfig: distributionConfigPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### `register_special_nft`

Link a special NFT to its token allocation.

**Accounts:**
```rust
pub struct RegisterSpecialNFT<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority
    )]
    pub distribution_config: Account<'info, DistributionConfig>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + NFTAllocation::LEN,
        seeds = [b"allocation", nft_mint.key().as_ref()],
        bump
    )]
    pub nft_allocation: Account<'info, NFTAllocation>,
    
    pub nft_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}
```

**Arguments:**
```rust
pub struct RegisterSpecialNFTArgs {
    pub vesting_duration: i64,  // Seconds
}
```

**Example:**
```typescript
const VESTING_DURATION = 365 * 24 * 60 * 60;  // 1 year

const tx = await program.methods
  .registerSpecialNft({
    vestingDuration: new BN(VESTING_DURATION),
  })
  .accounts({
    authority: authority.publicKey,
    distributionConfig: distributionConfigPDA,
    nftAllocation: nftAllocationPDA,
    nftMint: specialNftMint.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

#### `claim_tokens`

Claim vested tokens from special NFT allocation.

**Accounts:**
```rust
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        has_one = owner
    )]
    pub nft_allocation: Account<'info, NFTAllocation>,
    
    #[account(mut)]
    pub distribution_pool: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub distribution_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}
```

**Vesting Calculation:**
```rust
let elapsed = current_time - nft_allocation.vesting_start;
let vested_amount = if elapsed >= nft_allocation.vesting_duration {
    nft_allocation.total_amount
} else {
    (nft_allocation.total_amount * elapsed) / nft_allocation.vesting_duration
};
let claimable = vested_amount - nft_allocation.claimed_amount;
```

**Example:**
```typescript
const tx = await program.methods
  .claimTokens()
  .accounts({
    owner: owner.publicKey,
    nftAllocation: nftAllocationPDA,
    distributionPool: distributionPoolAccount,
    userTokenAccount: userTokenAccount,
    distributionAuthority: distributionAuthorityPDA,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### Account Structures

#### `DistributionConfig`

```rust
pub struct DistributionConfig {
    pub authority: Pubkey,          // 32 bytes
    pub total_allocation: u64,      // 8 bytes
    pub registered_count: u8,       // 1 byte
    pub bump: u8,                   // 1 byte
}
// Total: 42 bytes
```

#### `NFTAllocation`

```rust
pub struct NFTAllocation {
    pub nft_mint: Pubkey,           // 32 bytes
    pub owner: Pubkey,              // 32 bytes
    pub total_amount: u64,          // 8 bytes
    pub claimed_amount: u64,        // 8 bytes
    pub vesting_start: i64,         // 8 bytes
    pub vesting_duration: i64,      // 8 bytes
    pub bump: u8,                   // 1 byte
}
// Total: 97 bytes
```

### Errors

```rust
pub enum ErrorCode {
    #[msg("Maximum 25 special NFTs already registered")]
    MaxNFTsReached,
    
    #[msg("No tokens available to claim")]
    NoTokensToClaim,
    
    #[msg("NFT not owned by claimer")]
    NotNFTOwner,
}
```

---

## Common Patterns

### PDA Derivation

```typescript
// Tax Config PDA
const [taxConfigPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("tax_config")],
  TOKEN_PROGRAM_ID
);

// NFT Account PDA
const [nftAccountPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("nft"), nftMint.toBuffer()],
  NFT_PROGRAM_ID
);

// Stake Account PDA
const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("stake"), vault.toBuffer(), nftMint.toBuffer()],
  VAULT_PROGRAM_ID
);

// NFT Allocation PDA
const [nftAllocationPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("allocation"), nftMint.toBuffer()],
  DISTRIBUTION_PROGRAM_ID
);
```

### Error Handling

```typescript
try {
  const tx = await program.methods
    .stakeNft()
    .accounts({...})
    .rpc();
  console.log("Success:", tx);
} catch (error) {
  if (error.message.includes("NotNFTOwner")) {
    console.error("You don't own this NFT");
  } else if (error.message.includes("InsufficientRewards")) {
    console.error("Vault has insufficient rewards");
  } else {
    console.error("Transaction failed:", error);
  }
}
```

### Event Listening

```typescript
// Listen for NFT evolution events
program.addEventListener("NFTEvolved", (event, slot) => {
  console.log("NFT evolved:", {
    mint: event.mint.toString(),
    oldTier: event.oldTier,
    newTier: event.newTier,
    slot,
  });
});

// Listen for stake events
program.addEventListener("NFTStaked", (event, slot) => {
  console.log("NFT staked:", {
    owner: event.owner.toString(),
    nftMint: event.nftMint.toString(),
    vault: event.vault.toString(),
    slot,
  });
});
```

---

## Next Steps

- 🔧 [Frontend Integration](./frontend-integration.md) - Build your dApp
- 🧪 [Testing Guide](./testing.md) - Test your integration
- 📖 [API Reference](./api-reference.md) - TypeScript SDK docs

---

**Need Help?** Join our [Discord](#) or email dev@pangi.io
