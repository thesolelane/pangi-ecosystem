# $CATH Token Integration Guide

## Token Information

**Token Name**: CATH (Conservation Action Token for Habitat)  
**Symbol**: $CATH  
**Contract Address**: `48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA`  
**Blockchain**: Solana  
**Type**: SPL Token  

---

## Integration Overview

$CATH is the **utility token** for the PANGI ecosystem, used for:
1. NFT unlocks (primary use case)
2. Staking rewards
3. Breeding fees (future)
4. Marketplace transactions
5. Guardian rewards
6. Merchandise purchases

---

## Smart Contract Integration

### 1. NFT Unlock System

**Function**: Unlock adult NFT by paying $CATH

**Process**:
```rust
pub fn unlock_adult_nft(
    ctx: Context<UnlockAdult>,
    pangopup_id: u64,
) -> Result<()> {
    let pangopup_owner = &ctx.accounts.pangopup_owner;
    let cath_payment = &ctx.accounts.cath_payment;
    
    // Verify pangopup ownership
    require!(
        ctx.accounts.pangopup_nft.owner == pangopup_owner.key(),
        ErrorCode::NotPangopupOwner
    );
    
    // Verify payment amount (10,000 CATH)
    require!(
        cath_payment.amount >= 10_000_000_000, // 10,000 CATH (9 decimals)
        ErrorCode::InsufficientPayment
    );
    
    // Calculate adult NFT ID
    let adult_id = pangopup_id + 1500;
    
    // Transfer CATH tokens
    // 50% to burn address
    transfer_cath(
        &ctx.accounts.user_cath_account,
        &ctx.accounts.burn_address,
        5_000_000_000, // 5,000 CATH
    )?;
    
    // 30% to staking rewards pool
    transfer_cath(
        &ctx.accounts.user_cath_account,
        &ctx.accounts.staking_rewards_pool,
        3_000_000_000, // 3,000 CATH
    )?;
    
    // 20% to treasury
    transfer_cath(
        &ctx.accounts.user_cath_account,
        &ctx.accounts.treasury,
        2_000_000_000, // 2,000 CATH
    )?;
    
    // Airdrop adult NFT
    airdrop_adult_nft(
        &ctx.accounts.user,
        adult_id,
    )?;
    
    // Emit event
    emit!(AdultUnlocked {
        pangopup_id,
        adult_id,
        user: pangopup_owner.key(),
        cath_burned: 5_000_000_000,
    });
    
    Ok(())
}
```

---

### 2. NFT Staking Rewards

**Function**: Stake NFT, earn $CATH rewards

**Reward Rates**:
- Pangopup: 10 $CATH/day
- Adult: 15 $CATH/day
- Pair (Pangopup + Adult): 30 $CATH/day (20% bonus)

**Process**:
```rust
pub fn claim_staking_rewards(
    ctx: Context<ClaimRewards>,
) -> Result<()> {
    let staking_account = &mut ctx.accounts.staking_account;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Calculate time staked
    let time_staked = current_time - staking_account.last_claim_time;
    let days_staked = time_staked / 86400; // seconds per day
    
    // Calculate rewards based on NFT type
    let daily_rate = match staking_account.nft_type {
        NftType::Pangopup => 10_000_000_000, // 10 CATH
        NftType::Adult => 15_000_000_000,    // 15 CATH
        NftType::Pair => 30_000_000_000,     // 30 CATH
    };
    
    let rewards = daily_rate * days_staked as u64;
    
    // Transfer rewards from pool
    transfer_cath(
        &ctx.accounts.staking_rewards_pool,
        &ctx.accounts.user_cath_account,
        rewards,
    )?;
    
    // Update last claim time
    staking_account.last_claim_time = current_time;
    
    // Emit event
    emit!(RewardsClaimed {
        user: ctx.accounts.user.key(),
        amount: rewards,
        nft_type: staking_account.nft_type,
    });
    
    Ok(())
}
```

---

### 3. $PANGI Staking for $CATH

**Function**: Stake $PANGI, earn $CATH rewards

**Reward Tiers**:
```rust
pub enum StakingTier {
    Tier1, // 1,000 PANGI, 30 days, 30% APY
    Tier2, // 10,000 PANGI, 60 days, 50% APY
    Tier3, // 100,000 PANGI, 90 days, 75% APY
    Tier4, // 1,000,000 PANGI, 180 days, 100% APY
}

pub fn calculate_cath_rewards(
    pangi_amount: u64,
    tier: StakingTier,
    days_staked: u64,
) -> u64 {
    let apy = match tier {
        StakingTier::Tier1 => 30,
        StakingTier::Tier2 => 50,
        StakingTier::Tier3 => 75,
        StakingTier::Tier4 => 100,
    };
    
    // Calculate CATH rewards
    // Formula: (PANGI_amount * APY / 100) * (days_staked / 365)
    let yearly_rewards = (pangi_amount * apy) / 100;
    let rewards = (yearly_rewards * days_staked) / 365;
    
    rewards
}
```

---

## Token Accounts Setup

### Required Accounts

**1. Burn Address**:
```
Address: CATHBurnXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Purpose: Permanent burn (50% of unlock fees)
Type: Token account with no authority
```

**2. Staking Rewards Pool**:
```
Address: [To be determined]
Purpose: Holds CATH for staking rewards
Initial Balance: 50,000,000 CATH
Authority: Program PDA
```

**3. Treasury**:
```
Address: [To be determined]
Purpose: Development fund, buybacks
Authority: Multi-sig (3-of-5)
```

**4. Liquidity Pools**:
```
CATH/SOL: Raydium pool
CATH/PANGI: Raydium pool
CATH/USDC: Future pool
```

---

## Token Transfer Functions

### Transfer $CATH

```rust
use anchor_spl::token::{self, Transfer};

pub fn transfer_cath<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    amount: u64,
    authority: &Signer<'info>,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        cpi_accounts,
    );
    
    token::transfer(cpi_ctx, amount)?;
    
    Ok(())
}
```

### Burn $CATH

```rust
use anchor_spl::token::{self, Burn};

pub fn burn_cath<'info>(
    token_account: &Account<'info, TokenAccount>,
    mint: &Account<'info, Mint>,
    amount: u64,
    authority: &Signer<'info>,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    let cpi_accounts = Burn {
        mint: mint.to_account_info(),
        from: token_account.to_account_info(),
        authority: authority.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        cpi_accounts,
    );
    
    token::burn(cpi_ctx, amount)?;
    
    Ok(())
}
```

---

## Frontend Integration

### 1. Connect to $CATH Token

```typescript
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const CATH_MINT = new PublicKey('48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA');

// Get user's CATH token account
async function getUserCathAccount(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<PublicKey | null> {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    userPublicKey,
    { mint: CATH_MINT }
  );
  
  if (tokenAccounts.value.length === 0) {
    return null; // User doesn't have CATH account
  }
  
  return tokenAccounts.value[0].pubkey;
}

// Get CATH balance
async function getCathBalance(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<number> {
  const cathAccount = await getUserCathAccount(connection, userPublicKey);
  
  if (!cathAccount) {
    return 0;
  }
  
  const accountInfo = await connection.getTokenAccountBalance(cathAccount);
  return accountInfo.value.uiAmount || 0;
}
```

---

### 2. Unlock Adult NFT

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';

async function unlockAdultNft(
  program: Program,
  provider: AnchorProvider,
  pangopupId: number
): Promise<string> {
  const userPublicKey = provider.wallet.publicKey;
  
  // Get user's CATH token account
  const userCathAccount = await getAssociatedTokenAddress(
    CATH_MINT,
    userPublicKey
  );
  
  // Get program accounts
  const burnAddress = new PublicKey('CATHBurnXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  const stakingRewardsPool = new PublicKey('[STAKING_REWARDS_POOL]');
  const treasury = new PublicKey('[TREASURY]');
  
  // Call unlock function
  const tx = await program.methods
    .unlockAdultNft(pangopupId)
    .accounts({
      user: userPublicKey,
      pangopupNft: /* pangopup NFT account */,
      userCathAccount,
      burnAddress,
      stakingRewardsPool,
      treasury,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  
  return tx; // Transaction signature
}
```

---

### 3. Stake NFT for $CATH

```typescript
async function stakeNftForCath(
  program: Program,
  provider: AnchorProvider,
  nftMint: PublicKey,
  nftType: 'pangopup' | 'adult' | 'pair'
): Promise<string> {
  const userPublicKey = provider.wallet.publicKey;
  
  // Create staking account
  const [stakingAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from('staking'),
      userPublicKey.toBuffer(),
      nftMint.toBuffer(),
    ],
    program.programId
  );
  
  // Call stake function
  const tx = await program.methods
    .stakeNft(nftType)
    .accounts({
      user: userPublicKey,
      nftMint,
      stakingAccount,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  return tx;
}
```

---

### 4. Claim Staking Rewards

```typescript
async function claimStakingRewards(
  program: Program,
  provider: AnchorProvider,
  stakingAccount: PublicKey
): Promise<string> {
  const userPublicKey = provider.wallet.publicKey;
  
  // Get user's CATH token account
  const userCathAccount = await getAssociatedTokenAddress(
    CATH_MINT,
    userPublicKey
  );
  
  // Get staking rewards pool
  const stakingRewardsPool = new PublicKey('[STAKING_REWARDS_POOL]');
  
  // Call claim function
  const tx = await program.methods
    .claimStakingRewards()
    .accounts({
      user: userPublicKey,
      stakingAccount,
      userCathAccount,
      stakingRewardsPool,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  
  return tx;
}
```

---

## Price Oracle Integration

### Get $CATH Price

```typescript
import { Jupiter } from '@jup-ag/core';

async function getCathPrice(
  connection: Connection
): Promise<number> {
  // Option 1: Jupiter API
  const response = await fetch(
    `https://price.jup.ag/v4/price?ids=${CATH_MINT.toString()}`
  );
  const data = await response.json();
  return data.data[CATH_MINT.toString()]?.price || 0;
  
  // Option 2: Calculate from pool reserves
  // Get CATH/SOL pool reserves
  // Calculate price based on ratio
}

// Calculate unlock cost in USD
async function getUnlockCostUsd(
  connection: Connection
): Promise<number> {
  const cathPrice = await getCathPrice(connection);
  const unlockCostCath = 10000; // 10,000 CATH
  return unlockCostCath * cathPrice;
}
```

---

## Dynamic Pricing (Future)

### Adjust Unlock Cost Based on USD Value

```rust
pub fn calculate_dynamic_unlock_cost(
    cath_price_usd: f64,
    target_usd: f64,
) -> u64 {
    // Target: $500 USD
    // If CATH = $0.01: Cost = 50,000 CATH
    // If CATH = $0.05: Cost = 10,000 CATH
    // If CATH = $0.10: Cost = 5,000 CATH
    
    let cost_cath = (target_usd / cath_price_usd) as u64;
    
    // Apply limits
    let min_cost = 5_000_000_000;  // 5,000 CATH minimum
    let max_cost = 50_000_000_000; // 50,000 CATH maximum
    
    cost_cath.clamp(min_cost, max_cost)
}
```

---

## Testing

### Devnet Testing

**1. Get Test $CATH**:
```bash
# Airdrop test CATH (devnet only)
spl-token create-account 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA
spl-token mint 48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA 10000 [YOUR_TOKEN_ACCOUNT]
```

**2. Test Unlock**:
```bash
# Test unlock adult NFT
anchor test -- --features devnet
```

**3. Test Staking**:
```bash
# Test NFT staking for CATH rewards
anchor test -- --features devnet --test staking
```

---

## Security Considerations

### 1. Token Account Validation

```rust
// Always verify token mint
require!(
    ctx.accounts.user_cath_account.mint == CATH_MINT,
    ErrorCode::InvalidTokenMint
);

// Verify token account owner
require!(
    ctx.accounts.user_cath_account.owner == ctx.accounts.user.key(),
    ErrorCode::InvalidTokenOwner
);
```

### 2. Amount Validation

```rust
// Verify sufficient balance
let balance = ctx.accounts.user_cath_account.amount;
require!(
    balance >= required_amount,
    ErrorCode::InsufficientBalance
);

// Prevent overflow
let total_cost = unlock_cost
    .checked_add(fee)
    .ok_or(ErrorCode::Overflow)?;
```

### 3. Burn Address Security

```rust
// Verify burn address has no authority
require!(
    ctx.accounts.burn_address.authority.is_none(),
    ErrorCode::InvalidBurnAddress
);

// Or use actual burn instruction
token::burn(ctx, amount)?;
```

---

## Monitoring & Analytics

### Track $CATH Metrics

```typescript
// Track total burned
async function getTotalCathBurned(
  connection: Connection
): Promise<number> {
  const burnAddress = new PublicKey('CATHBurnXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  const balance = await connection.getTokenAccountBalance(burnAddress);
  return balance.value.uiAmount || 0;
}

// Track unlock count
async function getUnlockCount(
  program: Program
): Promise<number> {
  const unlockTracker = await program.account.unlockTracker.fetch(
    /* tracker PDA */
  );
  return unlockTracker.totalUnlocks;
}

// Calculate burn rate
async function calculateBurnRate(
  connection: Connection,
  days: number
): Promise<number> {
  // Get historical burn data
  // Calculate daily burn rate
  // Return average
}
```

---

## Wallet Integration

### Support for Major Wallets

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function CathWalletIntegration() {
  const { publicKey, connected } = useWallet();
  const [cathBalance, setCathBalance] = useState(0);
  
  useEffect(() => {
    if (connected && publicKey) {
      getCathBalance(connection, publicKey).then(setCathBalance);
    }
  }, [connected, publicKey]);
  
  return (
    <div>
      <WalletMultiButton />
      {connected && (
        <div>
          <p>CATH Balance: {cathBalance.toLocaleString()}</p>
          <button onClick={handleUnlock}>
            Unlock Adult (10,000 CATH)
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

### Common Errors

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient CATH balance")]
    InsufficientBalance,
    
    #[msg("Invalid token mint (not CATH)")]
    InvalidTokenMint,
    
    #[msg("Not the owner of this Pangopup")]
    NotPangopupOwner,
    
    #[msg("Adult already unlocked")]
    AlreadyUnlocked,
    
    #[msg("Invalid burn address")]
    InvalidBurnAddress,
    
    #[msg("Arithmetic overflow")]
    Overflow,
    
    #[msg("Staking rewards pool depleted")]
    RewardsPoolDepleted,
}
```

---

## Deployment Checklist

### Pre-Launch

- [ ] Verify $CATH token address: `48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA`
- [ ] Create burn address (no authority)
- [ ] Fund staking rewards pool (50M CATH)
- [ ] Set up treasury multi-sig
- [ ] Deploy smart contracts to devnet
- [ ] Test all functions thoroughly
- [ ] Audit smart contracts
- [ ] Deploy to mainnet
- [ ] Verify on Solscan/Solana Explorer

### Post-Launch

- [ ] Monitor burn rate
- [ ] Track unlock count
- [ ] Monitor staking participation
- [ ] Adjust emission rates if needed
- [ ] Provide liquidity (CATH/SOL, CATH/PANGI)
- [ ] List on CoinGecko/CoinMarketCap
- [ ] Update documentation

---

## Support & Resources

**Token Contract**: `48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA`

**Explorer Links**:
- Solscan: `https://solscan.io/token/48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA`
- Solana Explorer: `https://explorer.solana.com/address/48rmvKgpGpUNUuH3n2UYTZS2AUxZEkaCiNjQ57q1duMA`

**DEX Links**:
- Raydium: [To be added after liquidity]
- Jupiter: [To be added after liquidity]

**Documentation**:
- Tokenomics: `CATH_TOKENOMICS.md`
- Dual-Token Model: `DUAL_TOKEN_MODEL.md`
- NFT Unlock System: `NFT_UNLOCK_SYSTEM.md`

---

## Next Steps

1. **Set up token accounts** (burn, rewards pool, treasury)
2. **Implement unlock function** in smart contract
3. **Implement staking rewards** in smart contract
4. **Test on devnet** with test CATH
5. **Audit contracts** before mainnet
6. **Deploy to mainnet** and activate utility
7. **Monitor metrics** and adjust as needed

**Ready to implement? Let's start with the smart contract integration!**
