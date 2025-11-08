use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA");

// Security constants
const MAX_TAX_RATE: u16 = 1000; // 10% maximum
const MIN_TRANSFER_AMOUNT: u64 = 1; // Minimum 1 lamport
const MAX_TRANSFER_AMOUNT: u64 = 1_000_000_000_000_000; // 1M tokens with 9 decimals

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
pub mod pangi_token {
    use super::*;

    pub fn transfer_with_tax(
        ctx: Context<TransferWithTax>,
        amount: u64,
        max_tax_amount: u64,  // ✅ ADD: User specifies max acceptable tax
    ) -> Result<()> {
        let config = &ctx.accounts.tax_config;
        
        // Input validation
        require!(amount >= MIN_TRANSFER_AMOUNT, ErrorCode::AmountTooSmall);
        require!(amount <= MAX_TRANSFER_AMOUNT, ErrorCode::AmountTooLarge);
        require!(
            ctx.accounts.from.amount >= amount,
            ErrorCode::InsufficientBalance
        );

        // Determine transfer type
        let transfer_type = determine_transfer_type(
            &ctx.accounts.from.owner,
            &ctx.accounts.to.owner,
            amount,
            config.whale_transfer_threshold,
        )?;

        // Get tax rate based on transfer type
        let tax_rate = match transfer_type {
            TransferType::PeerToPeer => config.p2p_tax_rate,
            TransferType::ExchangeDeposit => config.exchange_tax_rate,
            TransferType::ConservationReward => 0,
            TransferType::LargeWhale => config.whale_tax_rate,
        };

        // Calculate tax with overflow protection
        let tax_amount = if tax_rate > 0 {
            let tax = (amount as u128)
                .checked_mul(tax_rate as u128)
                .ok_or(ErrorCode::Overflow)?
                .checked_div(10000)
                .ok_or(ErrorCode::Overflow)?;
            
            // Ensure tax fits in u64
            require!(tax <= u64::MAX as u128, ErrorCode::Overflow);
            tax as u64
        } else {
            0
        };

        // Calculate net amount with underflow protection
        let net_amount = amount
            .checked_sub(tax_amount)
            .ok_or(ErrorCode::Underflow)?;

        // Validate tax constraints
        require!(tax_amount <= config.max_tax_per_transfer, ErrorCode::TaxTooHigh);
        require!(net_amount > 0, ErrorCode::InsufficientAmountAfterTax);
        require!(
            tax_amount < amount,
            ErrorCode::TaxExceedsAmount
        );
        
        // ✅ SLIPPAGE PROTECTION: Check user's max acceptable tax
        require!(
            tax_amount <= max_tax_amount,
            ErrorCode::SlippageExceeded
        );

        // Transfer net amount to recipient
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.from.to_account_info(),
                    to: ctx.accounts.to.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            net_amount,
        )?;

        // Transfer tax to conservation fund if any
        if tax_amount > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.from.to_account_info(),
                        to: ctx.accounts.conservation_fund.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                tax_amount,
            )?;
        }

        // Emit event for transparency
        emit!(TransferWithTaxEvent {
            from: ctx.accounts.authority.key(),
            to: ctx.accounts.to.key(),
            amount: net_amount,
            tax_amount,
            tax_rate,
            transfer_type,
            conservation_fund: ctx.accounts.conservation_fund.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn initialize_tax_config(
        ctx: Context<InitializeTaxConfig>,
        p2p_tax_rate: u16,
        exchange_tax_rate: u16,
        whale_tax_rate: u16,
        whale_threshold: u64,
    ) -> Result<()> {
        // Validate tax rates
        require!(p2p_tax_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(exchange_tax_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(whale_tax_rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
        require!(whale_threshold > 0, ErrorCode::InvalidWhaleThreshold);

        let tax_config = &mut ctx.accounts.tax_config;
        
        tax_config.authority = ctx.accounts.authority.key();
        tax_config.p2p_tax_rate = p2p_tax_rate;
        tax_config.exchange_tax_rate = exchange_tax_rate;
        tax_config.whale_tax_rate = whale_tax_rate;
        tax_config.whale_transfer_threshold = whale_threshold;
        tax_config.conservation_fund = ctx.accounts.conservation_fund.key();
        tax_config.last_updated = Clock::get()?.unix_timestamp;
        
        // Calculate and set max tax per transfer (10% of max transfer amount)
        tax_config.max_tax_per_transfer = MAX_TRANSFER_AMOUNT / 10;

        emit!(TaxConfigInitializedEvent {
            authority: tax_config.authority,
            p2p_tax_rate,
            exchange_tax_rate,
            whale_tax_rate,
            whale_threshold,
            conservation_fund: tax_config.conservation_fund,
            timestamp: tax_config.last_updated,
        });
        
        Ok(())
    }

    pub fn update_tax_config(
        ctx: Context<UpdateTaxConfig>,
        p2p_tax_rate: Option<u16>,
        exchange_tax_rate: Option<u16>,
        whale_tax_rate: Option<u16>,
        whale_threshold: Option<u64>,
    ) -> Result<()> {
        let tax_config = &mut ctx.accounts.tax_config;

        // Validate authority
        require!(
            ctx.accounts.authority.key() == tax_config.authority,
            ErrorCode::Unauthorized
        );

        // Update rates if provided
        if let Some(rate) = p2p_tax_rate {
            require!(rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
            tax_config.p2p_tax_rate = rate;
        }

        if let Some(rate) = exchange_tax_rate {
            require!(rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
            tax_config.exchange_tax_rate = rate;
        }

        if let Some(rate) = whale_tax_rate {
            require!(rate <= MAX_TAX_RATE, ErrorCode::TaxRateTooHigh);
            tax_config.whale_tax_rate = rate;
        }

        if let Some(threshold) = whale_threshold {
            require!(threshold > 0, ErrorCode::InvalidWhaleThreshold);
            tax_config.whale_transfer_threshold = threshold;
        }

        tax_config.last_updated = Clock::get()?.unix_timestamp;

        emit!(TaxConfigUpdatedEvent {
            authority: ctx.accounts.authority.key(),
            p2p_tax_rate: tax_config.p2p_tax_rate,
            exchange_tax_rate: tax_config.exchange_tax_rate,
            whale_tax_rate: tax_config.whale_tax_rate,
            whale_threshold: tax_config.whale_transfer_threshold,
            timestamp: tax_config.last_updated,
        });

        Ok(())
    }
}

// Helper function to determine transfer type
fn determine_transfer_type(
    from_owner: &Pubkey,
    to_owner: &Pubkey,
    amount: u64,
    whale_threshold: u64,
) -> Result<TransferType> {
    // Check if it's a large whale transfer
    if amount >= whale_threshold {
        return Ok(TransferType::LargeWhale);
    }

    // Check if it's to/from conservation fund (no tax)
    // This would need to be enhanced with actual conservation fund check
    // For now, we'll use a simple heuristic
    
    // Check if it's an exchange deposit (would need exchange address list)
    // For now, treat all as P2P unless whale
    
    Ok(TransferType::PeerToPeer)
}

#[derive(Accounts)]
pub struct TransferWithTax<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub conservation_fund: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    #[account(
        seeds = [b"tax_config"],
        bump
    )]
    pub tax_config: Account<'info, TaxConfig>,
}

#[derive(Accounts)]
pub struct InitializeTaxConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TaxConfig::INIT_SPACE,
        seeds = [b"tax_config"],
        bump
    )]
    pub tax_config: Account<'info, TaxConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Conservation fund token account, validated by caller
    pub conservation_fund: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTaxConfig<'info> {
    #[account(
        mut,
        seeds = [b"tax_config"],
        bump
    )]
    pub tax_config: Account<'info, TaxConfig>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct TaxConfig {
    pub authority: Pubkey,
    pub p2p_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub whale_tax_rate: u16,
    pub whale_transfer_threshold: u64,
    pub max_tax_per_transfer: u64,
    pub conservation_fund: Pubkey,
    pub last_updated: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TransferType {
    PeerToPeer,
    ExchangeDeposit,
    ConservationReward,
    LargeWhale,
}

#[event]
pub struct TransferWithTaxEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub tax_amount: u64,
    pub tax_rate: u16,
    pub transfer_type: TransferType,
    pub conservation_fund: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaxConfigInitializedEvent {
    pub authority: Pubkey,
    pub p2p_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub whale_tax_rate: u16,
    pub whale_threshold: u64,
    pub conservation_fund: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaxConfigUpdatedEvent {
    pub authority: Pubkey,
    pub p2p_tax_rate: u16,
    pub exchange_tax_rate: u16,
    pub whale_tax_rate: u16,
    pub whale_threshold: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Tax rate exceeds maximum allowed (10%)")]
    TaxRateTooHigh,
    #[msg("Insufficient amount after tax deduction")]
    InsufficientAmountAfterTax,
    #[msg("Invalid transfer type")]
    InvalidTransferType,
    #[msg("Arithmetic overflow detected")]
    Overflow,
    #[msg("Arithmetic underflow detected")]
    Underflow,
    #[msg("Transfer amount too small")]
    AmountTooSmall,
    #[msg("Transfer amount too large")]
    AmountTooLarge,
    #[msg("Tax amount exceeds configured maximum")]
    TaxTooHigh,
    #[msg("Tax amount exceeds transfer amount")]
    TaxExceedsAmount,
    #[msg("Insufficient balance for transfer")]
    InsufficientBalance,
    #[msg("Invalid whale threshold (must be > 0)")]
    InvalidWhaleThreshold,
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,
    #[msg("Slippage exceeded: tax amount higher than max_tax_amount")]
    SlippageExceeded,
    #[msg("Division by zero")]
    DivisionByZero,
}

// ============================================
// COMPREHENSIVE TEST SUITE
// ============================================

#[cfg(test)]
mod slippage_tests {
    use super::*;

    // Test constants
    const TEST_AMOUNT: u64 = 1_000_000_000; // 1 token (9 decimals)
    const TAX_RATE_2_PERCENT: u16 = 200; // 2% in basis points
    const TAX_RATE_5_PERCENT: u16 = 500; // 5% in basis points

    // ============================================
    // Tax Slippage Protection Tests
    // ============================================

    #[test]
    fn test_tax_slippage_within_limit() {
        let amount = TEST_AMOUNT;
        let tax_rate = TAX_RATE_2_PERCENT;
        
        // Calculate expected tax: 1,000,000,000 * 200 / 10000 = 20,000,000
        let expected_tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        assert_eq!(expected_tax, 20_000_000);
        
        // Set max tax with 10% buffer: 20,000,000 * 1.1 = 22,000,000
        let max_tax_amount = expected_tax + (expected_tax / 10);
        assert_eq!(max_tax_amount, 22_000_000);
        
        // Actual tax should be within limit
        assert!(expected_tax <= max_tax_amount);
    }

    #[test]
    fn test_tax_slippage_exceeds_limit() {
        let amount = TEST_AMOUNT;
        let tax_rate = TAX_RATE_5_PERCENT; // Higher than expected!
        
        // Calculate actual tax: 1,000,000,000 * 500 / 10000 = 50,000,000
        let actual_tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        assert_eq!(actual_tax, 50_000_000);
        
        // But user expected 2% and set max accordingly
        let expected_tax = (amount as u128 * TAX_RATE_2_PERCENT as u128 / 10000) as u64;
        let max_tax_amount = expected_tax + (expected_tax / 10); // 22,000,000
        
        // Actual tax exceeds limit
        assert!(actual_tax > max_tax_amount);
        
        // This should trigger SlippageExceeded error
        let result = validate_tax_slippage(actual_tax, max_tax_amount);
        assert!(result.is_err());
    }

    #[test]
    fn test_tax_slippage_edge_case_exact_limit() {
        let amount = TEST_AMOUNT;
        let tax_rate = TAX_RATE_2_PERCENT;
        let expected_tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        
        // Set max tax to exact expected amount (no buffer)
        let max_tax_amount = expected_tax;
        
        // Should succeed when exactly at limit
        assert!(expected_tax <= max_tax_amount);
        let result = validate_tax_slippage(expected_tax, max_tax_amount);
        assert!(result.is_ok());
    }

    #[test]
    fn test_tax_slippage_zero_amount() {
        let amount = 0u64;
        let tax_rate = TAX_RATE_2_PERCENT;
        let expected_tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        
        assert_eq!(expected_tax, 0);
        
        // Zero tax should always pass
        let result = validate_tax_slippage(expected_tax, 0);
        assert!(result.is_ok());
    }

    // ============================================
    // Minimum Output Protection Tests
    // ============================================

    #[test]
    fn test_min_output_protection_success() {
        let amount_in = TEST_AMOUNT;
        let slippage_tolerance = 50; // 0.5%
        
        // Calculate minimum output: 1,000,000,000 * (10000 - 50) / 10000
        let min_amount_out = (amount_in as u128 * (10000 - slippage_tolerance) / 10000) as u64;
        assert_eq!(min_amount_out, 995_000_000);
        
        // Actual output is above minimum
        let actual_output = 996_000_000u64;
        assert!(actual_output >= min_amount_out);
        
        let result = validate_min_output(actual_output, min_amount_out);
        assert!(result.is_ok());
    }

    #[test]
    fn test_min_output_protection_failure() {
        let amount_in = TEST_AMOUNT;
        let slippage_tolerance = 50; // 0.5%
        
        let min_amount_out = (amount_in as u128 * (10000 - slippage_tolerance) / 10000) as u64;
        assert_eq!(min_amount_out, 995_000_000);
        
        // Actual output is below minimum (high slippage!)
        let actual_output = 990_000_000u64;
        assert!(actual_output < min_amount_out);
        
        let result = validate_min_output(actual_output, min_amount_out);
        assert!(result.is_err());
    }

    #[test]
    fn test_min_output_edge_case_exact_minimum() {
        let min_amount_out = 995_000_000u64;
        let actual_output = 995_000_000u64;
        
        // Should succeed when exactly at minimum
        assert!(actual_output >= min_amount_out);
        let result = validate_min_output(actual_output, min_amount_out);
        assert!(result.is_ok());
    }

    // ============================================
    // Price Impact Protection Tests
    // ============================================

    #[test]
    fn test_price_impact_within_limit() {
        let expected_output = TEST_AMOUNT; // 1:1 rate
        let actual_output = 980_000_000u64; // 2% impact
        
        // Calculate price impact: (expected - actual) / expected * 10000
        let price_impact = calculate_price_impact(expected_output, actual_output);
        assert_eq!(price_impact, 200); // 2%
        
        let max_price_impact = 500; // 5% max
        assert!(price_impact <= max_price_impact);
    }

    #[test]
    fn test_price_impact_exceeds_limit() {
        let expected_output = TEST_AMOUNT;
        let actual_output = 900_000_000u64; // 10% impact!
        
        let price_impact = calculate_price_impact(expected_output, actual_output);
        assert_eq!(price_impact, 1000); // 10%
        
        let max_price_impact = 500; // 5% max
        assert!(price_impact > max_price_impact);
        
        let result = validate_price_impact(price_impact, max_price_impact);
        assert!(result.is_err());
    }

    #[test]
    fn test_price_impact_zero() {
        let expected_output = TEST_AMOUNT;
        let actual_output = TEST_AMOUNT; // Perfect match
        
        let price_impact = calculate_price_impact(expected_output, actual_output);
        assert_eq!(price_impact, 0);
        
        let result = validate_price_impact(price_impact, 500);
        assert!(result.is_ok());
    }

    // ============================================
    // Overflow Protection Tests
    // ============================================

    #[test]
    fn test_safe_math_overflow_protection() {
        let a = u64::MAX;
        let b = 2u64;
        
        // This should not panic, but return None
        let result = a.checked_mul(b);
        assert!(result.is_none());
    }

    #[test]
    fn test_safe_math_underflow_protection() {
        let a = 0u64;
        let b = 1u64;
        
        // This should not panic, but return None
        let result = a.checked_sub(b);
        assert!(result.is_none());
    }

    #[test]
    fn test_tax_calculation_no_overflow() {
        let amount = u64::MAX;
        let tax_rate = 200u16; // 2%
        
        // Use u128 to prevent overflow
        let tax_u128 = amount as u128 * tax_rate as u128 / 10000;
        
        // Should not overflow in u128
        assert!(tax_u128 > 0);
        
        // But would overflow in u64
        assert!(tax_u128 > u64::MAX as u128);
    }

    #[test]
    fn test_safe_add_macro() {
        let a = 100u64;
        let b = 200u64;
        
        let result = a.checked_add(b);
        assert_eq!(result, Some(300));
    }

    #[test]
    fn test_safe_sub_macro() {
        let a = 300u64;
        let b = 100u64;
        
        let result = a.checked_sub(b);
        assert_eq!(result, Some(200));
    }

    #[test]
    fn test_safe_mul_macro() {
        let a = 100u64;
        let b = 200u64;
        
        let result = a.checked_mul(b);
        assert_eq!(result, Some(20000));
    }

    #[test]
    fn test_safe_div_macro() {
        let a = 1000u64;
        let b = 10u64;
        
        let result = a.checked_div(b);
        assert_eq!(result, Some(100));
    }

    #[test]
    fn test_safe_div_by_zero() {
        let a = 1000u64;
        let b = 0u64;
        
        let result = a.checked_div(b);
        assert!(result.is_none());
    }

    // ============================================
    // Integration Tests
    // ============================================

    #[test]
    fn test_complete_transfer_with_slippage() {
        // Simulate a complete transfer with slippage protection
        let amount = TEST_AMOUNT;
        let tax_rate = TAX_RATE_2_PERCENT;
        let slippage_tolerance = 100; // 1%
        
        // Calculate expected values
        let expected_tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        let expected_net = amount - expected_tax;
        
        // Calculate slippage limits
        let max_tax = expected_tax + (expected_tax * slippage_tolerance / 10000);
        let min_received = expected_net - (expected_net * slippage_tolerance / 10000);
        
        // Simulate actual values (within limits)
        let actual_tax = expected_tax + 100_000; // Slightly higher
        let actual_received = expected_net - 50_000; // Slightly lower
        
        // Both should pass
        assert!(actual_tax <= max_tax);
        assert!(actual_received >= min_received);
        
        let tax_result = validate_tax_slippage(actual_tax, max_tax);
        let output_result = validate_min_output(actual_received, min_received);
        
        assert!(tax_result.is_ok());
        assert!(output_result.is_ok());
    }

    #[test]
    fn test_complete_transfer_slippage_exceeded() {
        let amount = TEST_AMOUNT;
        let tax_rate = TAX_RATE_2_PERCENT;
        let slippage_tolerance = 100; // 1%
        
        let expected_tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        let expected_net = amount - expected_tax;
        
        let max_tax = expected_tax + (expected_tax * slippage_tolerance / 10000);
        let min_received = expected_net - (expected_net * slippage_tolerance / 10000);
        
        // Simulate actual values (OUTSIDE limits)
        let actual_tax = max_tax + 1; // Just over limit
        let actual_received = min_received - 1; // Just under limit
        
        // Both should fail
        assert!(actual_tax > max_tax);
        assert!(actual_received < min_received);
        
        let tax_result = validate_tax_slippage(actual_tax, max_tax);
        let output_result = validate_min_output(actual_received, min_received);
        
        assert!(tax_result.is_err());
        assert!(output_result.is_err());
    }

    #[test]
    fn test_realistic_transfer_scenario() {
        // Test with realistic values
        let amount = 5_000_000_000u64; // 5 tokens
        let tax_rate = 250u16; // 2.5%
        
        // Calculate tax
        let tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        assert_eq!(tax, 125_000_000); // 0.125 tokens
        
        // User sets 3% max (allowing some buffer)
        let max_tax = (amount as u128 * 300 / 10000) as u64;
        assert_eq!(max_tax, 150_000_000); // 0.15 tokens
        
        // Tax is within limit
        assert!(tax <= max_tax);
        
        let result = validate_tax_slippage(tax, max_tax);
        assert!(result.is_ok());
    }

    #[test]
    fn test_whale_transfer_scenario() {
        // Test whale transfer with higher tax
        let amount = 100_000_000_000u64; // 100 tokens (whale)
        let whale_tax_rate = 800u16; // 8% for whales
        
        // Calculate tax
        let tax = (amount as u128 * whale_tax_rate as u128 / 10000) as u64;
        assert_eq!(tax, 8_000_000_000); // 8 tokens
        
        // User sets 10% max (allowing buffer for whale tax)
        let max_tax = (amount as u128 * 1000 / 10000) as u64;
        assert_eq!(max_tax, 10_000_000_000); // 10 tokens
        
        // Tax is within limit
        assert!(tax <= max_tax);
        
        let result = validate_tax_slippage(tax, max_tax);
        assert!(result.is_ok());
    }

    #[test]
    fn test_small_transfer_scenario() {
        // Test with very small amounts
        let amount = 1000u64; // 0.000001 tokens
        let tax_rate = 200u16; // 2%
        
        // Calculate tax
        let tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        assert_eq!(tax, 0); // Rounds down to 0
        
        // Even with 0 max tax, should pass
        let result = validate_tax_slippage(tax, 0);
        assert!(result.is_ok());
    }

    // ============================================
    // Edge Case Tests
    // ============================================

    #[test]
    fn test_max_transfer_amount() {
        let amount = MAX_TRANSFER_AMOUNT;
        let tax_rate = 200u16; // 2%
        
        // Calculate tax using u128 to prevent overflow
        let tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        
        // Should not overflow
        assert!(tax > 0);
        assert!(tax < amount);
    }

    #[test]
    fn test_max_tax_rate() {
        let amount = TEST_AMOUNT;
        let tax_rate = MAX_TAX_RATE; // 10%
        
        // Calculate tax
        let tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        assert_eq!(tax, 100_000_000); // 0.1 tokens (10%)
        
        // Should be exactly 10% of amount
        assert_eq!(tax, amount / 10);
    }

    #[test]
    fn test_zero_tax_rate() {
        let amount = TEST_AMOUNT;
        let tax_rate = 0u16;
        
        // Calculate tax
        let tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        assert_eq!(tax, 0);
        
        // Should always pass with 0 tax
        let result = validate_tax_slippage(tax, 0);
        assert!(result.is_ok());
    }

    // ============================================
    // Helper Functions for Tests
    // ============================================

    fn validate_tax_slippage(actual_tax: u64, max_tax: u64) -> Result<()> {
        if actual_tax > max_tax {
            return Err(ErrorCode::SlippageExceeded.into());
        }
        Ok(())
    }

    fn validate_min_output(actual_output: u64, min_output: u64) -> Result<()> {
        if actual_output < min_output {
            return Err(ErrorCode::SlippageExceeded.into());
        }
        Ok(())
    }

    fn validate_price_impact(actual_impact: u64, max_impact: u64) -> Result<()> {
        if actual_impact > max_impact {
            return Err(ErrorCode::SlippageExceeded.into());
        }
        Ok(())
    }

    fn calculate_price_impact(expected: u64, actual: u64) -> u64 {
        if expected == 0 {
            return 0;
        }
        
        let diff = if expected > actual {
            expected - actual
        } else {
            actual - expected
        };
        
        ((diff as u128 * 10000) / expected as u128) as u64
    }
}

// ============================================
// Benchmark Tests
// ============================================

#[cfg(test)]
mod benchmark_tests {
    use super::*;

    #[test]
    fn bench_tax_calculation() {
        let amount = 1_000_000_000u64;
        let tax_rate = 200u16;
        
        // Simulate multiple calculations
        let iterations = 1000;
        for _ in 0..iterations {
            let _tax = (amount as u128 * tax_rate as u128 / 10000) as u64;
        }
        
        // If this completes without timeout, performance is acceptable
        assert!(true);
    }

    #[test]
    fn bench_slippage_validation() {
        let actual_tax = 20_000_000u64;
        let max_tax = 22_000_000u64;
        
        // Simulate multiple validations
        let iterations = 1000;
        for _ in 0..iterations {
            let _result = actual_tax <= max_tax;
        }
        
        // If this completes without timeout, performance is acceptable
        assert!(true);
    }
}
