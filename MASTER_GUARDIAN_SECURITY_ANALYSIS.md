# Master/Guardian System - Security Analysis

## Executive Summary

Comprehensive security analysis of the new Master/Guardian NFT system and wallet structure.

**Status**: ⚠️ **DESIGN PHASE** - Not yet implemented  
**Risk Level**: **HIGH** - Handles user funds and sensitive data  
**Audit Required**: ✅ **YES** - Professional audit mandatory before mainnet

---

## Security Architecture Review

### ✅ Strong Security Features

#### 1. Cryptographic Key Derivation (HKDF)
```rust
// One-way key derivation
Master Key → HKDF → Delegated Pass
         (cannot reverse)
```

**Strengths**:
- ✅ Uses industry-standard HKDF (HMAC-based Key Derivation Function)
- ✅ One-way derivation (cryptographically impossible to reverse)
- ✅ Unique pass per Guardian (includes Guardian pubkey in derivation)
- ✅ Scope-limited (includes permission scope in derivation)

**Verification Needed**:
- ⚠️ Ensure proper HKDF implementation (use audited library)
- ⚠️ Verify salt/info parameters are correctly used
- ⚠️ Test that delegated pass cannot derive master key

#### 2. Encryption (AES-256-GCM)
```rust
// Wallet encryption
Encrypted Data = AES-256-GCM(plaintext, master_key, nonce)
```

**Strengths**:
- ✅ AES-256-GCM is industry standard
- ✅ Authenticated encryption (prevents tampering)
- ✅ Nonce prevents replay attacks

**Risks**:
- ⚠️ **CRITICAL**: Nonce reuse = catastrophic failure
- ⚠️ **HIGH**: Key management (master key exposure)
- ⚠️ **MEDIUM**: Nonce generation (must be cryptographically random)

**Mitigations Required**:
```rust
// MUST implement proper nonce handling
pub fn encrypt_wallet(data: &[u8], key: &[u8; 32]) -> Result<Vec<u8>> {
    // Generate cryptographically secure random nonce
    let mut nonce = [0u8; 12];
    getrandom::getrandom(&mut nonce)?; // Use getrandom crate
    
    // NEVER reuse nonce with same key
    require!(
        !nonce_already_used(&nonce, key),
        ErrorCode::NonceReuse
    );
    
    // Encrypt with AES-256-GCM
    let cipher = Aes256Gcm::new(key.into());
    let ciphertext = cipher.encrypt(&nonce.into(), data)
        .map_err(|_| ErrorCode::EncryptionFailed)?;
    
    // Store nonce with ciphertext
    Ok([nonce.to_vec(), ciphertext].concat())
}
```

#### 3. Seed Phrase (BIP39)
```
24-word seed phrase → Private key → Public key → Master NFT
```

**Strengths**:
- ✅ BIP39 is industry standard
- ✅ 24 words = 256 bits entropy (very strong)
- ✅ Checksum prevents typos
- ✅ Compatible with hardware wallets

**Risks**:
- ⚠️ **CRITICAL**: User loses seed phrase = permanent loss
- ⚠️ **CRITICAL**: Seed phrase exposure = full compromise
- ⚠️ **HIGH**: Phishing attacks (fake seed phrase prompts)
- ⚠️ **MEDIUM**: Weak randomness in generation

**Mitigations Required**:
```rust
// MUST use cryptographically secure RNG
use rand::rngs::OsRng;
use bip39::{Mnemonic, Language};

pub fn generate_seed_phrase() -> Result<Mnemonic> {
    // Use OS-provided CSPRNG
    let mut entropy = [0u8; 32]; // 256 bits
    OsRng.fill_bytes(&mut entropy);
    
    // Generate BIP39 mnemonic
    let mnemonic = Mnemonic::from_entropy(&entropy, Language::English)
        .map_err(|_| ErrorCode::SeedGenerationFailed)?;
    
    // Verify checksum
    require!(
        mnemonic.check_word_count(),
        ErrorCode::InvalidWordCount
    );
    
    Ok(mnemonic)
}
```

---

## Vulnerability Analysis

### 🔴 CRITICAL Vulnerabilities

#### 1. Master Key Storage
**Issue**: Master encryption key must be stored securely

**Current Design**:
```rust
pub struct MasterNFT {
    pub encryption_key_hash: [u8; 32], // Only hash stored on-chain
}
```

**Risk**: If master key is stored on-chain (even encrypted), it's vulnerable

**Attack Scenarios**:
- Attacker gains access to on-chain data
- Attacker brute-forces encryption
- Attacker exploits key derivation weakness

**Mitigation**:
```rust
// NEVER store master key on-chain
// Only store hash for verification
pub struct MasterNFT {
    pub encryption_key_hash: [u8; 32], // Hash only
    // Master key stays client-side only
}

// Verification
pub fn verify_master_key(
    provided_key: &[u8; 32],
    stored_hash: &[u8; 32],
) -> bool {
    let computed_hash = hash(provided_key);
    constant_time_eq(&computed_hash, stored_hash)
}
```

#### 2. Delegated Pass Revocation
**Issue**: No mechanism to revoke compromised Guardian passes

**Current Design**: Guardian pass hash stored, but no revocation list

**Risk**: Compromised Guardian can continue operating

**Attack Scenarios**:
- Guardian NFT stolen
- Delegated pass leaked
- Malicious Guardian

**Mitigation**:
```rust
pub struct GuardianNFT {
    pub delegated_pass_hash: [u8; 32],
    pub is_revoked: bool,              // ADD: Revocation flag
    pub revoked_at: Option<i64>,       // ADD: Revocation timestamp
    pub revocation_reason: Option<String>, // ADD: Audit trail
}

pub fn revoke_guardian(
    ctx: Context<RevokeGuardian>,
) -> Result<()> {
    // Verify Master NFT ownership
    require!(
        ctx.accounts.master_nft_holder.key() == ctx.accounts.master_nft.authority,
        ErrorCode::Unauthorized
    );
    
    // Revoke Guardian
    let guardian = &mut ctx.accounts.guardian_nft;
    guardian.is_revoked = true;
    guardian.revoked_at = Some(Clock::get()?.unix_timestamp);
    
    emit!(GuardianRevoked {
        guardian_nft: guardian.key(),
        master_nft: ctx.accounts.master_nft.key(),
        revoked_at: guardian.revoked_at.unwrap(),
    });
    
    Ok(())
}

// Check revocation before every Guardian action
pub fn execute_guardian_action(
    ctx: Context<ExecuteGuardianAction>,
    action: Permission,
) -> Result<()> {
    // CHECK: Guardian not revoked
    require!(
        !ctx.accounts.guardian_nft.is_revoked,
        ErrorCode::GuardianRevoked
    );
    
    // ... rest of function
}
```

#### 3. Wallet Access Control
**Issue**: Need to verify Master NFT ownership for wallet access

**Risk**: Unauthorized wallet access if verification weak

**Attack Scenarios**:
- Attacker forges Master NFT ownership proof
- Attacker exploits signature verification weakness
- Replay attack with old signature

**Mitigation**:
```rust
pub fn access_wallet(
    ctx: Context<AccessWallet>,
    wallet_type: WalletType,
    master_key: [u8; 32],
    timestamp: i64,
    signature: [u8; 64],
) -> Result<Vec<u8>> {
    // 1. Verify Master NFT ownership
    require!(
        ctx.accounts.nft_holder.key() == ctx.accounts.master_nft.authority,
        ErrorCode::Unauthorized
    );
    
    // 2. Verify master key matches
    require!(
        hash(&master_key) == ctx.accounts.master_nft.encryption_key_hash,
        ErrorCode::InvalidKey
    );
    
    // 3. Verify signature (prevent replay)
    let message = format!(
        "ACCESS_WALLET:{}:{}:{}",
        wallet_type,
        timestamp,
        ctx.accounts.wallet_system.key()
    );
    require!(
        verify_signature(
            ctx.accounts.nft_holder.key(),
            message.as_bytes(),
            &signature
        ),
        ErrorCode::InvalidSignature
    );
    
    // 4. Check timestamp (prevent replay)
    let clock = Clock::get()?;
    require!(
        timestamp > clock.unix_timestamp - 300, // 5 min window
        ErrorCode::SignatureExpired
    );
    require!(
        timestamp <= clock.unix_timestamp,
        ErrorCode::SignatureFromFuture
    );
    
    // 5. Decrypt wallet
    let encrypted_wallet = &ctx.accounts.wallet_system.wallets[wallet_type];
    let decrypted = decrypt_aes256(
        &encrypted_wallet.encrypted_data,
        &master_key
    )?;
    
    Ok(decrypted)
}
```

### 🟠 HIGH Priority Vulnerabilities

#### 4. Permission Escalation
**Issue**: Guardian might escalate permissions without Master approval

**Risk**: Guardian gains unauthorized access

**Mitigation**:
```rust
pub fn update_guardian_permissions(
    ctx: Context<UpdateGuardianPermissions>,
    new_permissions: Vec<Permission>,
) -> Result<()> {
    // MUST verify Master NFT ownership
    require!(
        ctx.accounts.master_nft_holder.key() == ctx.accounts.master_nft.authority,
        ErrorCode::Unauthorized
    );
    
    // MUST verify Master NFT matches Guardian's parent
    require!(
        ctx.accounts.master_nft.key() == ctx.accounts.guardian_nft.master_nft,
        ErrorCode::UnauthorizedMaster
    );
    
    // MUST verify new permissions don't exceed limits
    for permission in &new_permissions {
        match permission {
            Permission::TransferTokens { max_amount } => {
                require!(
                    *max_amount <= MAX_GUARDIAN_TRANSFER,
                    ErrorCode::PermissionExceedsLimit
                );
            },
            _ => {}
        }
    }
    
    // Log permission change for audit
    emit!(PermissionsUpdated {
        guardian: ctx.accounts.guardian_nft.key(),
        old_permissions: ctx.accounts.guardian_nft.permissions.clone(),
        new_permissions: new_permissions.clone(),
        updated_by: ctx.accounts.master_nft_holder.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    ctx.accounts.guardian_nft.permissions = new_permissions;
    Ok(())
}
```

#### 5. Wallet Subdomain Limits
**Issue**: Users might exceed subdomain limits

**Risk**: Unbounded storage, DoS

**Mitigation**:
```rust
pub fn add_custom_subdomain(
    ctx: Context<AddCustomSubdomain>,
    subdomain_name: String,
) -> Result<()> {
    let wallet_system = &mut ctx.accounts.wallet_system;
    
    // CHECK: Not exceeding limit
    require!(
        wallet_system.wallet_count < wallet_system.max_allowed_wallets,
        ErrorCode::MaxSubdomainsReached
    );
    
    // CHECK: Subdomain name length
    require!(
        subdomain_name.len() <= MAX_SUBDOMAIN_NAME_LENGTH,
        ErrorCode::SubdomainNameTooLong
    );
    
    // CHECK: Subdomain name valid characters
    require!(
        subdomain_name.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_'),
        ErrorCode::InvalidSubdomainName
    );
    
    // CHECK: Subdomain not already exists
    for wallet in &wallet_system.custom_subdomains {
        if let Some(w) = wallet {
            require!(
                w.name != subdomain_name,
                ErrorCode::SubdomainAlreadyExists
            );
        }
    }
    
    // Add subdomain
    // ... rest of function
}
```

#### 6. Integer Overflow in Permission Limits
**Issue**: Transfer limits might overflow

**Risk**: Guardian transfers more than allowed

**Mitigation**:
```rust
pub fn execute_guardian_transfer(
    ctx: Context<ExecuteGuardianTransfer>,
    amount: u64,
) -> Result<()> {
    let guardian = &ctx.accounts.guardian_nft;
    
    // Get transfer limit from permissions
    let max_amount = match guardian.permissions.iter().find(|p| matches!(p, Permission::TransferTokens { .. })) {
        Some(Permission::TransferTokens { max_amount }) => *max_amount,
        _ => return Err(ErrorCode::PermissionDenied.into()),
    };
    
    // CHECK: Amount within limit (with overflow protection)
    require!(
        amount <= max_amount,
        ErrorCode::AmountExceedsLimit
    );
    
    // CHECK: Daily limit (with overflow protection)
    let daily_total = guardian.daily_transfer_total
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;
    
    require!(
        daily_total <= guardian.daily_transfer_limit,
        ErrorCode::DailyLimitExceeded
    );
    
    // Update daily total (safe math)
    ctx.accounts.guardian_nft.daily_transfer_total = daily_total;
    
    // Execute transfer
    // ... rest of function
}
```

### 🟡 MEDIUM Priority Vulnerabilities

#### 7. Nonce Management
**Issue**: Encryption nonces must never be reused

**Risk**: Nonce reuse breaks AES-GCM security

**Mitigation**:
```rust
#[account]
pub struct EncryptedWallet {
    pub encrypted_data: Vec<u8>,
    pub nonce: [u8; 12],              // Store nonce with data
    pub nonce_counter: u64,           // Counter to prevent reuse
    pub last_encryption_timestamp: i64, // Additional entropy
}

pub fn encrypt_wallet_data(
    wallet: &mut EncryptedWallet,
    data: &[u8],
    key: &[u8; 32],
) -> Result<()> {
    // Generate unique nonce
    let mut nonce = [0u8; 12];
    
    // Use counter + timestamp + random for uniqueness
    let counter = wallet.nonce_counter
        .checked_add(1)
        .ok_or(ErrorCode::NonceCounterOverflow)?;
    
    let timestamp = Clock::get()?.unix_timestamp;
    
    let mut rng_bytes = [0u8; 4];
    getrandom::getrandom(&mut rng_bytes)?;
    
    // Combine for unique nonce
    nonce[0..8].copy_from_slice(&counter.to_le_bytes());
    nonce[8..12].copy_from_slice(&rng_bytes);
    
    // Verify nonce not reused
    require!(
        nonce != wallet.nonce,
        ErrorCode::NonceReuse
    );
    
    // Encrypt
    let cipher = Aes256Gcm::new(key.into());
    let ciphertext = cipher.encrypt(&nonce.into(), data)
        .map_err(|_| ErrorCode::EncryptionFailed)?;
    
    // Update wallet
    wallet.encrypted_data = ciphertext;
    wallet.nonce = nonce;
    wallet.nonce_counter = counter;
    wallet.last_encryption_timestamp = timestamp;
    
    Ok(())
}
```

#### 8. Seed Phrase Phishing
**Issue**: Users might be tricked into revealing seed phrase

**Risk**: Complete wallet compromise

**Mitigation** (Frontend):
```typescript
// NEVER prompt for full seed phrase in app
// Only use for recovery/import

// Add warnings
const SeedPhraseWarning = () => (
  <div className="warning-banner">
    <h3>⚠️ CRITICAL SECURITY WARNING</h3>
    <ul>
      <li>PANGI will NEVER ask for your seed phrase</li>
      <li>NEVER share your seed phrase with anyone</li>
      <li>NEVER enter seed phrase on websites</li>
      <li>Only use seed phrase for wallet recovery</li>
    </ul>
  </div>
);

// Verify domain before seed phrase entry
function verifySeedPhraseEntry() {
  // Check we're on official domain
  if (window.location.hostname !== 'official-pangi-domain.com') {
    throw new Error('PHISHING ATTEMPT DETECTED');
  }
  
  // Show warning
  const confirmed = confirm(
    'You are about to enter your seed phrase. ' +
    'This should ONLY be done for wallet recovery. ' +
    'Are you sure you want to continue?'
  );
  
  if (!confirmed) {
    return;
  }
  
  // Proceed with recovery
}
```

---

## Existing Security (From Previous Work)

### ✅ Already Implemented

#### 1. Safe Math Operations
```rust
// From programs/pangi-nft/src/lib.rs
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
```

**Status**: ✅ Good - Must extend to Master/Guardian program

#### 2. Access Control
```rust
// Existing pattern
require!(
    ctx.accounts.authority.key() == hatchling.authority,
    ErrorCode::Unauthorized
);
```

**Status**: ✅ Good - Must extend to Master/Guardian verification

#### 3. Input Validation
```rust
// Existing pattern
require!(series == 1 || series == 2, ErrorCode::InvalidSeries);
```

**Status**: ✅ Good - Must extend to permission validation

---

## Security Checklist for Implementation

### Pre-Implementation

- [ ] Review all cryptographic libraries (use audited crates)
- [ ] Design threat model
- [ ] Define security requirements
- [ ] Plan key management strategy
- [ ] Design revocation mechanism
- [ ] Plan audit scope

### During Implementation

#### Smart Contracts

- [ ] Use safe math operations (checked_add, checked_sub, etc.)
- [ ] Implement proper access control (Master NFT verification)
- [ ] Validate all inputs (subdomain names, amounts, etc.)
- [ ] Add revocation mechanism for Guardians
- [ ] Implement nonce management for encryption
- [ ] Add event logging for all critical operations
- [ ] Use constant-time comparisons for secrets
- [ ] Implement rate limiting where appropriate

#### Cryptography

- [ ] Use audited crypto libraries (aes-gcm, hkdf, bip39)
- [ ] Never store master key on-chain (only hash)
- [ ] Generate cryptographically secure random numbers
- [ ] Implement proper nonce handling (never reuse)
- [ ] Use authenticated encryption (AES-GCM)
- [ ] Implement key derivation correctly (HKDF)
- [ ] Test that delegated pass cannot derive master key

#### Frontend

- [ ] Never prompt for seed phrase except recovery
- [ ] Add phishing warnings
- [ ] Verify domain before sensitive operations
- [ ] Implement secure storage (never localStorage for keys)
- [ ] Add transaction preview before signing
- [ ] Implement proper error handling
- [ ] Add rate limiting on client side

### Testing

- [ ] Unit tests for all functions
- [ ] Integration tests for cross-program calls
- [ ] Fuzz testing for input validation
- [ ] Penetration testing for access control
- [ ] Cryptographic testing (key derivation, encryption)
- [ ] Revocation testing
- [ ] Overflow/underflow testing
- [ ] Replay attack testing

### Pre-Deployment

- [ ] Professional security audit (MANDATORY)
- [ ] Bug bounty program
- [ ] Testnet deployment and testing
- [ ] Stress testing
- [ ] Documentation review
- [ ] Incident response plan
- [ ] Monitoring setup

---

## Recommended Security Audits

### Scope

1. **Cryptographic Implementation**
   - HKDF key derivation
   - AES-256-GCM encryption
   - BIP39 seed phrase generation
   - Nonce management

2. **Access Control**
   - Master NFT verification
   - Guardian permission enforcement
   - Wallet access control
   - Revocation mechanism

3. **Smart Contract Security**
   - Integer overflow/underflow
   - Reentrancy
   - Access control
   - Input validation
   - PDA derivation

4. **Integration Security**
   - Cross-program calls
   - Token transfers
   - NFT operations
   - Wallet operations

### Recommended Auditors

- **Kudelski Security** (Solana specialists)
- **Trail of Bits** (Comprehensive audits)
- **Halborn** (Blockchain security)
- **OtterSec** (Solana focus)

### Estimated Cost

- **Basic Audit**: $30,000 - $50,000
- **Comprehensive Audit**: $75,000 - $150,000
- **Timeline**: 4-8 weeks

---

## Risk Assessment

### Overall Risk Level: **HIGH**

**Justification**:
- Handles user funds (high value)
- Manages sensitive data (documents, medical, ID)
- Complex cryptography (key derivation, encryption)
- New system (no battle-testing)
- Self-custody (no recovery if compromised)

### Risk Matrix

| Component | Likelihood | Impact | Risk Level |
|-----------|-----------|--------|------------|
| Master Key Exposure | Medium | Critical | **HIGH** |
| Delegated Pass Leak | High | Medium | **HIGH** |
| Permission Escalation | Low | High | **MEDIUM** |
| Nonce Reuse | Low | Critical | **MEDIUM** |
| Seed Phrase Phishing | High | Critical | **HIGH** |
| Integer Overflow | Low | Medium | **LOW** |
| Access Control Bypass | Low | Critical | **MEDIUM** |

---

## Recommendations

### Immediate (Before Implementation)

1. ✅ **Hire Security Auditor** - Schedule audit before mainnet
2. ✅ **Use Audited Libraries** - Only use well-tested crypto crates
3. ✅ **Design Threat Model** - Document all attack vectors
4. ✅ **Implement Revocation** - Add Guardian revocation mechanism
5. ✅ **Add Monitoring** - Log all critical operations

### Short-Term (During Implementation)

1. ✅ **Follow Checklist** - Use security checklist for all code
2. ✅ **Write Tests** - Comprehensive test coverage
3. ✅ **Code Review** - Multiple reviewers for security-critical code
4. ✅ **Fuzz Testing** - Test edge cases and invalid inputs
5. ✅ **Documentation** - Document all security assumptions

### Long-Term (Post-Launch)

1. ✅ **Bug Bounty** - Ongoing bug bounty program
2. ✅ **Monitoring** - Real-time monitoring of suspicious activity
3. ✅ **Incident Response** - Plan for security incidents
4. ✅ **Regular Audits** - Annual security audits
5. ✅ **User Education** - Ongoing security education for users

---

## Conclusion

### Summary

The Master/Guardian system has **strong cryptographic foundations** but requires **careful implementation** to be secure.

**Strengths**:
- ✅ Industry-standard cryptography (HKDF, AES-GCM, BIP39)
- ✅ One-way key derivation (delegated passes)
- ✅ Layered security (multiple encryption layers)
- ✅ Self-custody (no third-party risk)

**Risks**:
- ⚠️ Complex implementation (many attack vectors)
- ⚠️ High-value target (user funds and data)
- ⚠️ No recovery mechanism (lost keys = permanent loss)
- ⚠️ New system (no battle-testing)

**Verdict**: **AUDIT REQUIRED** before mainnet deployment

### Next Steps

1. **Implement security checklist** during development
2. **Write comprehensive tests** (unit, integration, fuzz)
3. **Schedule professional audit** (4-8 weeks before mainnet)
4. **Deploy to testnet** for public testing
5. **Launch bug bounty** program
6. **Monitor closely** after mainnet launch

**With proper implementation and auditing, this system can be highly secure.**

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-14  
**Status**: Design Phase - Not Yet Implemented  
**Audit Status**: ⚠️ Required Before Mainnet
