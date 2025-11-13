# Anti-Bot Measures for PANGI Programs

**Security Enhancement:** Comprehensive bot protection strategies

---

## 🤖 **Bot Attack Vectors**

### **Common Bot Attacks:**

1. **Spam Minting** - Bots mint all NFTs instantly
2. **Front-Running** - Bots see transactions and front-run them
3. **Sniping** - Bots claim rewards/tokens immediately
4. **Wash Trading** - Bots create fake volume
5. **Denial of Service** - Bots spam transactions

---

## 🛡️ **Implemented Protections**

### **1. Rate Limiting (Cooldowns)**

**✅ Already Added:**

```rust
// NFT Evolution
const MIN_EVOLUTION_COOLDOWN: i64 = 60; // 1 minute minimum

// Vault Operations
const CLAIM_COOLDOWN: i64 = 60 * 60; // 1 hour between claims
const DEPOSIT_COOLDOWN: i64 = 60; // 1 minute between deposits

// Distribution
// Linear vesting prevents instant claims
```

**Effect:**
- ✅ Prevents spam transactions
- ✅ Limits bot advantage
- ✅ Reduces network congestion

### **2. Supply Limits**

**✅ Already Added:**

```rust
// NFT Program
const MAX_TOTAL_NFTS: u64 = 10000;

pub struct GlobalConfig {
    pub total_minted: u64,
    pub max_supply: u64,
    pub mint_paused: bool,
}

// Check before minting
require!(
    global_config.total_minted < global_config.max_supply,
    ErrorCode::MaxSupplyReached
);
```

**Effect:**
- ✅ Prevents unlimited minting
- ✅ Creates scarcity
- ✅ Protects tokenomics

### **3. Slippage Protection**

**✅ Already Added:**

```rust
pub fn transfer_with_tax(
    ctx: Context<TransferWithTax>,
    amount: u64,
    max_tax_amount: u64,  // User specifies max acceptable tax
) -> Result<()> {
    // Calculate tax
    let tax_amount = calculate_tax(...)?;
    
    // Check slippage
    require!(
        tax_amount <= max_tax_amount,
        ErrorCode::SlippageExceeded
    );
}
```

**Effect:**
- ✅ Prevents sandwich attacks
- ✅ Protects users from unexpected costs
- ✅ Reduces MEV opportunities

---

## 🔒 **Additional Anti-Bot Strategies**

### **Strategy 1: Transaction Limits**

**Add per-wallet limits:**

```rust
#[account]
#[derive(InitSpace)]
pub struct UserStats {
    pub wallet: Pubkey,
    pub daily_transfers: u32,
    pub daily_mints: u32,
    pub last_reset: i64,
}

const MAX_DAILY_TRANSFERS: u32 = 100;
const MAX_DAILY_MINTS: u32 = 10;

pub fn transfer_with_tax(...) -> Result<()> {
    let user_stats = &mut ctx.accounts.user_stats;
    let clock = Clock::get()?;
    
    // Reset daily counter if new day
    if clock.unix_timestamp - user_stats.last_reset > 86400 {
        user_stats.daily_transfers = 0;
        user_stats.last_reset = clock.unix_timestamp;
    }
    
    // Check limit
    require!(
        user_stats.daily_transfers < MAX_DAILY_TRANSFERS,
        ErrorCode::DailyLimitExceeded
    );
    
    user_stats.daily_transfers += 1;
    
    // ... rest of transfer logic
}
```

### **Strategy 2: Whitelist/Allowlist**

**For initial mint:**

```rust
#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub total_minted: u64,
    pub max_supply: u64,
    pub mint_paused: bool,
    pub whitelist_only: bool,  // ✅ ADD
}

#[account]
#[derive(InitSpace)]
pub struct WhitelistEntry {
    pub wallet: Pubkey,
    pub max_mints: u8,
    pub minted: u8,
}

pub fn initialize_hatchling(...) -> Result<()> {
    let config = &ctx.accounts.global_config;
    
    // If whitelist active, check whitelist
    if config.whitelist_only {
        let whitelist = &mut ctx.accounts.whitelist_entry;
        
        require!(
            whitelist.wallet == ctx.accounts.authority.key(),
            ErrorCode::NotWhitelisted
        );
        
        require!(
            whitelist.minted < whitelist.max_mints,
            ErrorCode::WhitelistLimitReached
        );
        
        whitelist.minted += 1;
    }
    
    // ... rest of mint logic
}
```

### **Strategy 3: Progressive Pricing**

**Increase cost for rapid actions:**

```rust
#[account]
#[derive(InitSpace)]
pub struct MintConfig {
    pub base_price: u64,
    pub price_increment: u64,
    pub current_price: u64,
    pub last_mint_time: i64,
    pub price_decay_rate: u64,
}

pub fn initialize_hatchling(...) -> Result<()> {
    let mint_config = &mut ctx.accounts.mint_config;
    let clock = Clock::get()?;
    
    // Decay price over time
    let time_since_last = clock.unix_timestamp - mint_config.last_mint_time;
    let decay = time_since_last * mint_config.price_decay_rate;
    mint_config.current_price = mint_config.current_price
        .saturating_sub(decay)
        .max(mint_config.base_price);
    
    // Charge current price
    // (Transfer SOL from user to treasury)
    
    // Increase price for next mint
    mint_config.current_price += mint_config.price_increment;
    mint_config.last_mint_time = clock.unix_timestamp;
    
    // ... rest of mint logic
}
```

### **Strategy 4: CAPTCHA/Proof of Work**

**Require computation before action:**

```rust
pub fn initialize_hatchling(
    ctx: Context<InitializeHatchling>,
    evolution_cooldown: i64,
    nonce: u64,  // ✅ ADD: Proof of work nonce
) -> Result<()> {
    // Verify proof of work
    let hash = solana_program::hash::hash(&[
        ctx.accounts.authority.key().as_ref(),
        &nonce.to_le_bytes(),
    ]);
    
    // Check hash has required difficulty (e.g., starts with N zeros)
    require!(
        hash.to_bytes()[0] == 0 && hash.to_bytes()[1] == 0,
        ErrorCode::InvalidProofOfWork
    );
    
    // ... rest of mint logic
}
```

### **Strategy 5: Time-Based Phases**

**Different rules for different phases:**

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MintPhase {
    Closed,
    Whitelist,
    Public,
    Unlimited,
}

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub current_phase: MintPhase,
    pub phase_start_time: i64,
    pub phase_end_time: i64,
}

pub fn initialize_hatchling(...) -> Result<()> {
    let config = &ctx.accounts.global_config;
    let clock = Clock::get()?;
    
    // Check phase timing
    require!(
        clock.unix_timestamp >= config.phase_start_time,
        ErrorCode::PhaseNotStarted
    );
    require!(
        clock.unix_timestamp < config.phase_end_time,
        ErrorCode::PhaseEnded
    );
    
    // Apply phase-specific rules
    match config.current_phase {
        MintPhase::Closed => {
            return Err(ErrorCode::MintingClosed.into());
        }
        MintPhase::Whitelist => {
            // Check whitelist
            require!(
                ctx.accounts.whitelist_entry.is_some(),
                ErrorCode::NotWhitelisted
            );
        }
        MintPhase::Public => {
            // Apply cooldowns and limits
            // ... cooldown checks
        }
        MintPhase::Unlimited => {
            // No restrictions (for testing or special events)
        }
    }
    
    // ... rest of mint logic
}
```

### **Strategy 6: Randomized Delays**

**Add unpredictability:**

```rust
pub fn initialize_hatchling(...) -> Result<()> {
    let clock = Clock::get()?;
    
    // Use block timestamp for pseudo-randomness
    let random_delay = (clock.unix_timestamp % 10) as i64; // 0-9 seconds
    
    // Require minimum time since last action + random delay
    let required_wait = MIN_EVOLUTION_COOLDOWN + random_delay;
    
    require!(
        time_since_last >= required_wait,
        ErrorCode::CooldownActive
    );
    
    // ... rest of logic
}
```

### **Strategy 7: Reputation System**

**Track user behavior:**

```rust
#[account]
#[derive(InitSpace)]
pub struct UserReputation {
    pub wallet: Pubkey,
    pub reputation_score: u32,
    pub successful_actions: u32,
    pub failed_actions: u32,
    pub spam_reports: u32,
}

pub fn initialize_hatchling(...) -> Result<()> {
    let reputation = &mut ctx.accounts.user_reputation;
    
    // Require minimum reputation
    require!(
        reputation.reputation_score >= 100,
        ErrorCode::InsufficientReputation
    );
    
    // Penalize if spam detected
    if reputation.spam_reports > 5 {
        require!(
            reputation.reputation_score >= 500,
            ErrorCode::HighRiskUser
        );
    }
    
    // Increase reputation on success
    reputation.successful_actions += 1;
    reputation.reputation_score += 1;
    
    // ... rest of logic
}
```

---

## 📊 **Recommended Anti-Bot Stack**

### **Phase 1: Launch (Essential)**

✅ **Already Implemented:**
- Rate limiting (cooldowns)
- Supply limits
- Slippage protection
- Balance checks
- Authority validation

### **Phase 2: Early Days (Add Soon)**

**Priority additions:**
1. **Whitelist for initial mint**
   - Prevents bot sniping
   - Rewards community
   - Controlled launch

2. **Transaction limits**
   - Daily/hourly caps
   - Per-wallet limits
   - Prevents spam

3. **Time-based phases**
   - Whitelist → Public → Open
   - Gradual rollout
   - Reduces bot impact

### **Phase 3: Growth (Optional)**

**Advanced protections:**
1. Progressive pricing
2. Reputation system
3. Proof of work
4. Randomized delays

---

## 🎯 **Implementation Priority**

### **High Priority (Do Before Mainnet):**

1. ✅ **Cooldowns** - Already added
2. ✅ **Supply limits** - Already added
3. ✅ **Slippage protection** - Already added
4. ⬜ **Whitelist system** - Add for launch
5. ⬜ **Transaction limits** - Add for launch

### **Medium Priority (Add After Launch):**

6. ⬜ **Time-based phases** - For controlled rollout
7. ⬜ **Progressive pricing** - If bot issues arise
8. ⬜ **Reputation system** - For long-term health

### **Low Priority (Optional):**

9. ⬜ **Proof of work** - If severe bot issues
10. ⬜ **Randomized delays** - For additional unpredictability

---

## 💡 **Best Practices**

### **Do:**

✅ Start with simple protections (cooldowns, limits)
✅ Monitor bot activity after launch
✅ Add protections incrementally
✅ Test thoroughly before deploying
✅ Document all anti-bot measures
✅ Communicate clearly with users

### **Don't:**

❌ Over-complicate at launch
❌ Add friction for legitimate users
❌ Implement untested measures
❌ Ignore user feedback
❌ Make it impossible to use

---

## 📈 **Monitoring & Response**

### **What to Monitor:**

1. **Transaction patterns**
   - Unusual frequency
   - Identical timing
   - Same amounts

2. **Wallet behavior**
   - New wallets minting immediately
   - Coordinated actions
   - Rapid transfers

3. **Network metrics**
   - Transaction volume spikes
   - Failed transaction rates
   - Gas price manipulation

### **Response Plan:**

**If bots detected:**

1. **Immediate:**
   - Enable mint pause
   - Analyze attack pattern
   - Communicate with community

2. **Short-term:**
   - Add targeted protections
   - Blacklist bot wallets
   - Adjust parameters

3. **Long-term:**
   - Implement reputation system
   - Add progressive pricing
   - Enhance monitoring

---

## 🎉 **Summary**

**Your programs now have:**

✅ **Rate limiting** - Cooldowns on all operations
✅ **Supply limits** - Max NFT supply enforced
✅ **Slippage protection** - User-specified max tax
✅ **Balance validation** - All transfers checked
✅ **Authority checks** - Unauthorized access prevented

**Recommended additions:**

⬜ **Whitelist system** - For controlled launch
⬜ **Transaction limits** - Daily/hourly caps
⬜ **Time-based phases** - Gradual rollout

**Bot protection level:** 🟢 **GOOD** → 🟡 **EXCELLENT** (with additions)

---

**Next security concern?** Keep going! 🔒
