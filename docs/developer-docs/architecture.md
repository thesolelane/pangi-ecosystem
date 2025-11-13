# PANGI Architecture

This document provides a comprehensive overview of the PANGI ecosystem architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        PANGI Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Frontend   │◄────────┤  Solana RPC  │                  │
│  │  (Next.js)   │         │   Endpoint   │                  │
│  └──────┬───────┘         └──────────────┘                  │
│         │                                                     │
│         │ Wallet Adapter                                     │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │           Solana Blockchain (Devnet)                 │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   Token     │  │     NFT     │  │    Vault    │ │   │
│  │  │  Program    │  │   Program   │  │   Program   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │      Special Distribution Program           │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Frontend Layer (Next.js dApp)

**Technology Stack:**
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Wallet Integration**: Solana Wallet Adapter
- **State Management**: React Hooks
- **RPC Communication**: @solana/web3.js

**Key Components:**
```
pangi-dapp/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout with wallet provider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx         # Navigation & wallet button
│   ├── WalletInfo.tsx     # Wallet connection display
│   ├── TokenBalance.tsx   # PANGI token balance
│   ├── ProgramInfo.tsx    # Deployed programs info
│   └── WalletProvider.tsx # Wallet adapter setup
└── lib/                   # Utilities & constants
    ├── constants.ts       # Program IDs, addresses
    └── theme.ts           # Design tokens
```

**Responsibilities:**
- User interface and experience
- Wallet connection management
- Transaction signing and submission
- Real-time balance updates
- Program interaction via RPC

### 2. Blockchain Layer (Solana Programs)

Four independent programs deployed on Solana:

#### A. Token Program (`pangi-token`)

**Purpose**: SPL Token with dynamic tax system

**Key Features:**
- Mint/burn PANGI tokens
- Transfer with configurable tax (2-5%)
- Tax distribution to multiple destinations
- Authority-controlled configuration

**Accounts:**
```rust
pub struct TaxConfig {
    pub authority: Pubkey,           // Admin authority
    pub tax_rate: u16,               // Tax rate (basis points)
    pub conservation_fund: Pubkey,   // Conservation wallet
    pub liquidity_pool: Pubkey,      // LP wallet
    pub treasury: Pubkey,            // Treasury wallet
}
```

**Instructions:**
- `initialize` - Set up tax configuration
- `update_tax_config` - Modify tax parameters
- `transfer_with_tax` - Transfer tokens with tax deduction

#### B. NFT Program (`pangi-nft`)

**Purpose**: Dynamic NFT with evolution mechanics

**Key Features:**
- Mint PANGI NFTs
- 5-tier evolution system
- Metadata updates on evolution
- Evolution point tracking

**Evolution Tiers:**
```rust
pub enum EvolutionTier {
    Egg = 0,        // Starting tier
    Baby = 1,       // 100 points
    Juvenile = 2,   // 500 points
    Adult = 3,      // 2,000 points
    Legendary = 4,  // 10,000 points
}
```

**Accounts:**
```rust
pub struct PangiNFT {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub tier: EvolutionTier,
    pub evolution_points: u64,
    pub created_at: i64,
    pub last_evolved: i64,
}
```

**Instructions:**
- `mint_nft` - Create new NFT (starts at Egg)
- `evolve` - Upgrade to next tier
- `update_metadata` - Modify NFT metadata

#### C. Vault Program (`pangi-vault`)

**Purpose**: NFT staking with rewards

**Key Features:**
- Stake PANGI NFTs
- Earn PANGI token rewards
- Accumulate evolution points
- Multiple vault types with different rates

**Accounts:**
```rust
pub struct Vault {
    pub authority: Pubkey,
    pub reward_rate: u64,        // Tokens per second
    pub evolution_rate: u64,     // Points per second
    pub total_staked: u64,
    pub reward_pool: Pubkey,
}

pub struct StakeAccount {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub vault: Pubkey,
    pub staked_at: i64,
    pub last_claim: i64,
    pub accumulated_rewards: u64,
    pub accumulated_points: u64,
}
```

**Instructions:**
- `create_vault` - Initialize new vault
- `stake_nft` - Deposit NFT into vault
- `unstake_nft` - Withdraw NFT from vault
- `claim_rewards` - Collect earned tokens
- `claim_evolution_points` - Apply points to NFT

#### D. Special Distribution Program (`special-distribution`)

**Purpose**: Manage 63M PANGI distribution across 25 special NFTs

**Key Features:**
- Link NFTs to token allocations
- Vesting schedules
- Claim mechanisms
- Distribution tracking

**Accounts:**
```rust
pub struct DistributionConfig {
    pub authority: Pubkey,
    pub total_allocation: u64,      // 63,000,000 PANGI
    pub special_nfts: [Pubkey; 25], // 25 special NFT mints
    pub allocation_per_nft: u64,    // 2,520,000 PANGI each
}

pub struct NFTAllocation {
    pub nft_mint: Pubkey,
    pub owner: Pubkey,
    pub total_amount: u64,
    pub claimed_amount: u64,
    pub vesting_start: i64,
    pub vesting_duration: i64,
}
```

**Instructions:**
- `initialize_distribution` - Set up distribution config
- `register_special_nft` - Link NFT to allocation
- `claim_tokens` - Withdraw vested tokens
- `transfer_allocation` - Move allocation to new owner

## Data Flow

### NFT Minting Flow

```
User → Frontend → Wallet Adapter → NFT Program
                                        ↓
                                   Create Mint
                                        ↓
                                   Create Metadata
                                        ↓
                                   Initialize NFT Account
                                        ↓
                                   Return NFT to User
```

### Staking Flow

```
User → Frontend → Wallet Adapter → Vault Program
                                        ↓
                                   Verify NFT Ownership
                                        ↓
                                   Transfer NFT to Vault PDA
                                        ↓
                                   Create Stake Account
                                        ↓
                                   Start Reward Accumulation
```

### Evolution Flow

```
User → Frontend → Check Evolution Points
                        ↓
                   Sufficient Points?
                        ↓
                   Call NFT Program
                        ↓
                   Update Tier
                        ↓
                   Update Metadata
                        ↓
                   Emit Event
```

### Token Transfer Flow

```
User → Frontend → Token Program
                        ↓
                   Calculate Tax
                        ↓
                   Split Transfer:
                   - 95-98% to Recipient
                   - 2-5% Tax Split:
                     • 50% Conservation Fund
                     • 30% Liquidity Pool
                     • 20% Treasury
```

## Security Model

### Program Authority

Each program has an authority account that controls:
- Configuration updates
- Emergency pauses
- Parameter adjustments

**Authority Hierarchy:**
```
Master Authority (Multisig)
    ↓
Program Authorities
    ├── Token Program Authority
    ├── NFT Program Authority
    ├── Vault Program Authority
    └── Distribution Program Authority
```

### Account Validation

All programs implement strict account validation:
- Owner checks
- Signer verification
- PDA derivation validation
- Account data validation

**Example:**
```rust
// Verify account ownership
require!(
    nft_account.owner == *user.key,
    ErrorCode::Unauthorized
);

// Verify PDA
let (expected_pda, bump) = Pubkey::find_program_address(
    &[b"vault", nft_mint.key().as_ref()],
    program_id
);
require!(
    vault_pda.key() == expected_pda,
    ErrorCode::InvalidPDA
);
```

### Access Control

**Role-Based Permissions:**
- **Admin**: Full control over program configuration
- **User**: Can interact with their own assets
- **Program**: Cross-program invocations (CPI)

## Cross-Program Communication

Programs interact via Cross-Program Invocations (CPI):

### Example: Stake NFT

```rust
// Vault Program calls NFT Program to verify ownership
let cpi_accounts = VerifyOwnership {
    nft_account: ctx.accounts.nft_account.to_account_info(),
    owner: ctx.accounts.user.to_account_info(),
};
let cpi_ctx = CpiContext::new(
    ctx.accounts.nft_program.to_account_info(),
    cpi_accounts,
);
nft_program::cpi::verify_ownership(cpi_ctx)?;
```

### Example: Claim Rewards

```rust
// Vault Program calls Token Program to transfer rewards
let cpi_accounts = Transfer {
    from: ctx.accounts.reward_pool.to_account_info(),
    to: ctx.accounts.user_token_account.to_account_info(),
    authority: ctx.accounts.vault_authority.to_account_info(),
};
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
    signer_seeds,
);
token::transfer(cpi_ctx, reward_amount)?;
```

## State Management

### On-Chain State

All critical state is stored on-chain:
- NFT ownership and metadata
- Stake positions
- Reward calculations
- Distribution allocations

### Off-Chain Indexing (Future)

For performance, consider indexing:
- Historical transactions
- Leaderboards
- Analytics data
- User activity

**Potential Solutions:**
- The Graph Protocol
- GenesysGo Shadow Drive
- Custom indexer with PostgreSQL

## Scalability Considerations

### Current Limits

- **Transactions**: ~2,000 TPS (Solana devnet)
- **Account Size**: 10MB max per account
- **Compute Units**: 200k per transaction

### Optimization Strategies

1. **Batch Operations**: Group multiple operations
2. **PDA Optimization**: Minimize PDA derivations
3. **Account Compression**: Use Solana State Compression
4. **Parallel Processing**: Independent transactions

### Future Enhancements

- **Compressed NFTs**: Reduce minting costs
- **Lookup Tables**: Optimize account references
- **Versioned Transactions**: Support more accounts
- **Priority Fees**: Faster transaction inclusion

## Deployment Architecture

### Devnet (Current)

```
Programs:
├── Token: BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA
├── Vault: 5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2
├── NFT: etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE
└── Distribution: bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq

Frontend:
└── Deployed on Gitpod/Vercel (devnet RPC)
```

### Mainnet (Planned)

```
Programs:
├── Audited and verified
├── Immutable (upgrade authority removed)
└── Multisig authority

Frontend:
├── CDN deployment (Vercel/Cloudflare)
├── Mainnet RPC (GenesysGo/Helius)
└── Custom domain
```

## Monitoring & Observability

### Metrics to Track

**On-Chain:**
- Transaction success rate
- Average transaction time
- Program account growth
- Token supply and distribution

**Off-Chain:**
- Frontend uptime
- RPC endpoint latency
- User wallet connections
- Error rates

### Tools

- **Solana Explorer**: Transaction inspection
- **Solana Beach**: Account analytics
- **Custom Dashboard**: Real-time metrics
- **Sentry**: Error tracking

## Disaster Recovery

### Backup Strategy

1. **Program Code**: Git repository (version controlled)
2. **Deployment Keys**: Secure key management
3. **Configuration**: Environment variables backup
4. **State Snapshots**: Regular account data exports

### Emergency Procedures

1. **Program Pause**: Halt operations if vulnerability found
2. **Authority Transfer**: Multisig for critical decisions
3. **User Communication**: Discord/Twitter announcements
4. **Recovery Plan**: Step-by-step restoration process

## Next Steps

- 📖 [Program Reference](./program-reference.md) - Detailed API docs
- 🔧 [Frontend Integration](./frontend-integration.md) - Build on PANGI
- 🧪 [Testing Guide](./testing.md) - Test your integration

---

**Questions?** Join our [Discord](#) or email dev@pangi.io
