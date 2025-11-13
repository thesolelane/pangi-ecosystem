# Transfer Config Security Review

## Code Analysis

### Issues Identified

#### 🔴 Critical: Unbounded Vec Storage

**Problem:**
```rust
pub exchange_addresses: Vec<Pubkey>,
```

**Issues:**
1. **Account Size Limit** - Solana accounts have a 10MB limit. Each Pubkey is 32 bytes, so theoretically you could store ~312,500 addresses, but this is impractical.
2. **Compute Budget** - Iterating through a large Vec in `contains()` consumes compute units. With many addresses, you'll hit the compute limit (200k-1.4M units).
3. **Rent Costs** - Larger accounts cost more rent. A Vec with 1000 addresses would be ~32KB, costing significant SOL.
4. **DoS Attack** - Admin could add thousands of addresses, making transfers fail due to compute limits.

**Severity:** Critical - Can brick the program

**Fix:**
```rust
// Option 1: Use fixed-size array with max limit
pub const MAX_EXCHANGE_ADDRESSES: usize = 10;

#[account]
pub struct TransferConfig {
    pub exchange_addresses: [Pubkey; MAX_EXCHANGE_ADDRESSES],
    pub exchange_count: u8, // Track how many are actually used
    pub conservation_fund: Pubkey,
    pub default_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub conservation_tax_rate: u16,
}

pub fn detect_transfer_type(
    destination: &Pubkey,
    config: &TransferConfig
) -> TransferType {
    // Only check active addresses
    for i in 0..config.exchange_count as usize {
        if &config.exchange_addresses[i] == destination {
            return TransferType::Exchange;
        }
    }
    
    if destination == &config.conservation_fund {
        TransferType::Conservation
    } else {
        TransferType::Regular
    }
}

// Option 2: Use separate PDA per exchange (better for many exchanges)
#[account]
pub struct ExchangeRegistry {
    pub exchange: Pubkey,
    pub is_active: bool,
    pub added_at: i64,
}

// Derive PDA: seeds = [b"exchange", exchange_pubkey.as_ref()]
// Check existence instead of iterating
```

---

#### 🟡 High: Missing Access Control

**Problem:**
```rust
#[account]
pub struct TransferConfig {
    // No authority field!
}
```

**Issues:**
1. Who can update exchange addresses?
2. Who can change tax rates?
3. No audit trail of changes

**Fix:**
```rust
#[account]
pub struct TransferConfig {
    pub authority: Pubkey, // ✅ ADD
    pub exchange_addresses: [Pubkey; MAX_EXCHANGE_ADDRESSES],
    pub exchange_count: u8,
    pub conservation_fund: Pubkey,
    pub default_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub conservation_tax_rate: u16,
    pub last_updated: i64, // ✅ ADD: Audit trail
    pub bump: u8, // ✅ ADD: PDA bump
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized,
    )]
    pub config: Account<'info, TransferConfig>,
    pub authority: Signer<'info>,
}
```

---

#### 🟡 High: Missing Input Validation

**Problem:**
```rust
pub fn get_tax_rate(transfer_type: TransferType, config: &TransferConfig) -> u16 {
    match transfer_type {
        TransferType::Exchange => config.exchange_tax_rate,
        TransferType::Conservation => config.conservation_tax_rate,
        TransferType::Regular => config.default_tax_rate,
    }
}
```

**Issues:**
1. No validation that tax rates are reasonable
2. Could be set to 100% (10000 basis points) or higher
3. No maximum limit enforced

**Fix:**
```rust
const MAX_TAX_RATE: u16 = 1000; // 10% maximum

pub fn update_tax_rates(
    ctx: Context<UpdateConfig>,
    default_rate: u16,
    exchange_rate: u16,
    conservation_rate: u16,
) -> Result<()> {
    // Validate all rates
    require!(default_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
    require!(exchange_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
    require!(conservation_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
    
    let config = &mut ctx.accounts.config;
    config.default_tax_rate = default_rate;
    config.exchange_tax_rate = exchange_rate;
    config.conservation_tax_rate = conservation_rate;
    config.last_updated = Clock::get()?.unix_timestamp;
    
    emit!(TaxRatesUpdatedEvent {
        authority: ctx.accounts.authority.key(),
        default_rate,
        exchange_rate,
        conservation_rate,
        timestamp: config.last_updated,
    });
    
    Ok(())
}
```

---

#### 🟢 Medium: No Event Logging

**Problem:** Changes to config are not logged.

**Fix:**
```rust
#[event]
pub struct ExchangeAddedEvent {
    pub authority: Pubkey,
    pub exchange: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ExchangeRemovedEvent {
    pub authority: Pubkey,
    pub exchange: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaxRatesUpdatedEvent {
    pub authority: Pubkey,
    pub default_rate: u16,
    pub exchange_rate: u16,
    pub conservation_rate: u16,
    pub timestamp: i64,
}
```

---

#### 🟢 Medium: Inefficient Lookup

**Problem:**
```rust
if config.exchange_addresses.contains(destination) {
```

**Issues:**
- O(n) lookup time
- Consumes compute units proportional to array size
- Inefficient for frequent transfers

**Fix:**
```rust
// Use HashMap for O(1) lookup (if using Option 2 with PDAs)
// Or keep array small (max 10 addresses) for O(n) to be acceptable
```

---

## Recommended Implementation

```rust
use anchor_lang::prelude::*;

declare_id!("...");

const MAX_EXCHANGE_ADDRESSES: usize = 10;
const MAX_TAX_RATE: u16 = 1000; // 10%

#[program]
pub mod transfer_config {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        default_tax_rate: u16,
        exchange_tax_rate: u16,
        conservation_tax_rate: u16,
    ) -> Result<()> {
        // Validate rates
        require!(default_tax_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(exchange_tax_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(conservation_tax_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.exchange_addresses = [Pubkey::default(); MAX_EXCHANGE_ADDRESSES];
        config.exchange_count = 0;
        config.conservation_fund = ctx.accounts.conservation_fund.key();
        config.default_tax_rate = default_tax_rate;
        config.exchange_tax_rate = exchange_tax_rate;
        config.conservation_tax_rate = conservation_tax_rate;
        config.last_updated = Clock::get()?.unix_timestamp;
        config.bump = ctx.bumps.config;

        emit!(ConfigInitializedEvent {
            authority: config.authority,
            default_tax_rate,
            exchange_tax_rate,
            conservation_tax_rate,
            timestamp: config.last_updated,
        });

        Ok(())
    }

    pub fn add_exchange(
        ctx: Context<UpdateConfig>,
        exchange: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;

        // Check limit
        require!(
            (config.exchange_count as usize) < MAX_EXCHANGE_ADDRESSES,
            ErrorCode::ExchangeListFull
        );

        // Check for duplicates
        for i in 0..config.exchange_count as usize {
            require!(
                config.exchange_addresses[i] != exchange,
                ErrorCode::ExchangeAlreadyExists
            );
        }

        // Add exchange
        config.exchange_addresses[config.exchange_count as usize] = exchange;
        config.exchange_count += 1;
        config.last_updated = Clock::get()?.unix_timestamp;

        emit!(ExchangeAddedEvent {
            authority: ctx.accounts.authority.key(),
            exchange,
            timestamp: config.last_updated,
        });

        Ok(())
    }

    pub fn remove_exchange(
        ctx: Context<UpdateConfig>,
        exchange: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;

        // Find and remove exchange
        let mut found = false;
        for i in 0..config.exchange_count as usize {
            if config.exchange_addresses[i] == exchange {
                // Shift remaining addresses
                for j in i..config.exchange_count as usize - 1 {
                    config.exchange_addresses[j] = config.exchange_addresses[j + 1];
                }
                config.exchange_addresses[config.exchange_count as usize - 1] = Pubkey::default();
                config.exchange_count -= 1;
                found = true;
                break;
            }
        }

        require!(found, ErrorCode::ExchangeNotFound);

        config.last_updated = Clock::get()?.unix_timestamp;

        emit!(ExchangeRemovedEvent {
            authority: ctx.accounts.authority.key(),
            exchange,
            timestamp: config.last_updated,
        });

        Ok(())
    }

    pub fn update_tax_rates(
        ctx: Context<UpdateConfig>,
        default_rate: u16,
        exchange_rate: u16,
        conservation_rate: u16,
    ) -> Result<()> {
        // Validate rates
        require!(default_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(exchange_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(conservation_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);

        let config = &mut ctx.accounts.config;
        config.default_tax_rate = default_rate;
        config.exchange_tax_rate = exchange_rate;
        config.conservation_tax_rate = conservation_rate;
        config.last_updated = Clock::get()?.unix_timestamp;

        emit!(TaxRatesUpdatedEvent {
            authority: ctx.accounts.authority.key(),
            default_rate,
            exchange_rate,
            conservation_rate,
            timestamp: config.last_updated,
        });

        Ok(())
    }

    pub fn update_conservation_fund(
        ctx: Context<UpdateConfig>,
        new_fund: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let old_fund = config.conservation_fund;
        
        config.conservation_fund = new_fund;
        config.last_updated = Clock::get()?.unix_timestamp;

        emit!(ConservationFundUpdatedEvent {
            authority: ctx.accounts.authority.key(),
            old_fund,
            new_fund,
            timestamp: config.last_updated,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TransferConfig::INIT_SPACE,
        seeds = [b"transfer_config"],
        bump,
    )]
    pub config: Account<'info, TransferConfig>,
    
    /// CHECK: Conservation fund can be any account
    pub conservation_fund: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized,
    )]
    pub config: Account<'info, TransferConfig>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct TransferConfig {
    pub authority: Pubkey,
    pub exchange_addresses: [Pubkey; MAX_EXCHANGE_ADDRESSES],
    pub exchange_count: u8,
    pub conservation_fund: Pubkey,
    pub default_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub conservation_tax_rate: u16,
    pub last_updated: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TransferType {
    Regular,
    Exchange,
    Conservation,
}

// Helper functions
pub fn detect_transfer_type(
    destination: &Pubkey,
    config: &TransferConfig
) -> TransferType {
    // Check exchanges (O(n) but n is small, max 10)
    for i in 0..config.exchange_count as usize {
        if &config.exchange_addresses[i] == destination {
            return TransferType::Exchange;
        }
    }
    
    // Check conservation fund
    if destination == &config.conservation_fund {
        return TransferType::Conservation;
    }
    
    TransferType::Regular
}

pub fn get_tax_rate(transfer_type: TransferType, config: &TransferConfig) -> u16 {
    match transfer_type {
        TransferType::Exchange => config.exchange_tax_rate,
        TransferType::Conservation => config.conservation_tax_rate,
        TransferType::Regular => config.default_tax_rate,
    }
}

// Events
#[event]
pub struct ConfigInitializedEvent {
    pub authority: Pubkey,
    pub default_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub conservation_tax_rate: u16,
    pub timestamp: i64,
}

#[event]
pub struct ExchangeAddedEvent {
    pub authority: Pubkey,
    pub exchange: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ExchangeRemovedEvent {
    pub authority: Pubkey,
    pub exchange: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaxRatesUpdatedEvent {
    pub authority: Pubkey,
    pub default_rate: u16,
    pub exchange_rate: u16,
    pub conservation_rate: u16,
    pub timestamp: i64,
}

#[event]
pub struct ConservationFundUpdatedEvent {
    pub authority: Pubkey,
    pub old_fund: Pubkey,
    pub new_fund: Pubkey,
    pub timestamp: i64,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only authority can perform this action")]
    Unauthorized,
    
    #[msg("Tax rate too high: Maximum is 10%")]
    TaxRateTooHigh,
    
    #[msg("Exchange list is full: Maximum 10 exchanges")]
    ExchangeListFull,
    
    #[msg("Exchange already exists in the list")]
    ExchangeAlreadyExists,
    
    #[msg("Exchange not found in the list")]
    ExchangeNotFound,
}
```

---

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_exchange() {
        // Should add exchange successfully
    }

    #[test]
    fn test_add_duplicate_exchange() {
        // Should fail when adding duplicate
    }

    #[test]
    fn test_exchange_list_full() {
        // Should fail when adding 11th exchange
    }

    #[test]
    fn test_remove_exchange() {
        // Should remove exchange and shift array
    }

    #[test]
    fn test_tax_rate_validation() {
        // Should reject rates > 10%
    }

    #[test]
    fn test_unauthorized_update() {
        // Should reject non-authority updates
    }

    #[test]
    fn test_detect_transfer_type() {
        // Should correctly identify transfer types
    }
}
```

---

## Summary

### Critical Fixes Required

1. ✅ Replace `Vec<Pubkey>` with fixed-size array
2. ✅ Add authority field and access control
3. ✅ Add input validation for tax rates
4. ✅ Add event logging
5. ✅ Add proper error handling

### Security Improvements

- Bounded storage prevents DoS
- Access control prevents unauthorized changes
- Input validation prevents invalid states
- Event logging provides audit trail
- Efficient lookup with small array

### Performance

- Fixed array size: ~400 bytes
- O(n) lookup with n ≤ 10 is acceptable
- Low compute unit consumption
- Minimal rent cost

### Alternative: PDA-based Registry

For more than 10 exchanges, use separate PDAs:

```rust
// One PDA per exchange
#[account]
pub struct ExchangeRegistry {
    pub exchange: Pubkey,
    pub is_active: bool,
    pub added_at: i64,
    pub bump: u8,
}

// Seeds: [b"exchange", exchange_pubkey.as_ref()]
// Check: Try to load PDA, if exists -> is exchange
```

This scales to unlimited exchanges but requires more accounts.
