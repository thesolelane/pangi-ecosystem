# Multi-Sig Enhancement for PANGI Programs

**Security Enhancement:** Add multi-signature requirements for critical administrative operations.

---

## 🎯 Why Multi-Sig?

**Single authority risks:**
- ❌ Single point of failure
- ❌ Key compromise = total control
- ❌ No checks and balances
- ❌ Accidental misuse

**Multi-sig benefits:**
- ✅ Distributed control
- ✅ Requires consensus
- ✅ Prevents single key compromise
- ✅ Audit trail of approvals

---

## 🔒 Implementation Options

### **Option 1: Use Squads Protocol (Recommended)**

Squads is a battle-tested multi-sig solution on Solana.

**Setup:**
```bash
# Create a Squads multi-sig wallet
# Use it as the program authority
# Requires M-of-N signatures for transactions
```

**Advantages:**
- ✅ No code changes needed
- ✅ Battle-tested
- ✅ Easy to use
- ✅ UI available

**How it works:**
1. Create Squads multi-sig wallet
2. Set it as program authority
3. All admin operations require M-of-N signatures
4. Proposals created, voted on, executed

**Example:**
```typescript
// Instead of single authority
authority: "ApeKj1SVofC3Ur2SD2BMZhmoxw8FuRMdXDcMZJSRgyD3"

// Use Squads multi-sig address
authority: "SquadsMultiSigAddress123..."
// Requires 3-of-5 signatures for any operation
```

### **Option 2: Built-in Multi-Sig (Custom)**

Add multi-sig logic directly to your programs.

**Add to each program:**

```rust
#[account]
#[derive(InitSpace)]
pub struct MultiSigConfig {
    pub signers: Vec<Pubkey>,      // List of authorized signers
    pub threshold: u8,              // Required signatures (M-of-N)
    pub pending_tx_count: u64,      // Transaction counter
}

#[account]
#[derive(InitSpace)]
pub struct PendingTransaction {
    pub id: u64,
    pub instruction_data: Vec<u8>,  // Serialized instruction
    pub signatures: Vec<bool>,      // Who has signed
    pub signature_count: u8,        // Current signatures
    pub executed: bool,
    pub created_at: i64,
    pub expires_at: i64,
}

// Propose a transaction
pub fn propose_admin_action(
    ctx: Context<ProposeAdminAction>,
    instruction_data: Vec<u8>,
) -> Result<()> {
    let config = &ctx.accounts.multisig_config;
    let pending_tx = &mut ctx.accounts.pending_tx;
    
    // Verify proposer is authorized signer
    require!(
        config.signers.contains(&ctx.accounts.proposer.key()),
        ErrorCode::NotAuthorizedSigner
    );
    
    pending_tx.id = config.pending_tx_count;
    pending_tx.instruction_data = instruction_data;
    pending_tx.signatures = vec![false; config.signers.len()];
    pending_tx.signature_count = 0;
    pending_tx.executed = false;
    pending_tx.created_at = Clock::get()?.unix_timestamp;
    pending_tx.expires_at = pending_tx.created_at + (7 * 24 * 60 * 60); // 7 days
    
    Ok(())
}

// Sign a pending transaction
pub fn sign_transaction(
    ctx: Context<SignTransaction>,
) -> Result<()> {
    let config = &ctx.accounts.multisig_config;
    let pending_tx = &mut ctx.accounts.pending_tx;
    
    // Verify signer is authorized
    let signer_index = config.signers
        .iter()
        .position(|&s| s == ctx.accounts.signer.key())
        .ok_or(ErrorCode::NotAuthorizedSigner)?;
    
    // Check not already signed
    require!(
        !pending_tx.signatures[signer_index],
        ErrorCode::AlreadySigned
    );
    
    // Check not expired
    require!(
        Clock::get()?.unix_timestamp < pending_tx.expires_at,
        ErrorCode::TransactionExpired
    );
    
    // Check not already executed
    require!(!pending_tx.executed, ErrorCode::AlreadyExecuted);
    
    // Add signature
    pending_tx.signatures[signer_index] = true;
    pending_tx.signature_count += 1;
    
    emit!(TransactionSignedEvent {
        tx_id: pending_tx.id,
        signer: ctx.accounts.signer.key(),
        signature_count: pending_tx.signature_count,
        threshold: config.threshold,
    });
    
    Ok(())
}

// Execute when threshold reached
pub fn execute_transaction(
    ctx: Context<ExecuteTransaction>,
) -> Result<()> {
    let config = &ctx.accounts.multisig_config;
    let pending_tx = &mut ctx.accounts.pending_tx;
    
    // Check threshold reached
    require!(
        pending_tx.signature_count >= config.threshold,
        ErrorCode::InsufficientSignatures
    );
    
    // Check not expired
    require!(
        Clock::get()?.unix_timestamp < pending_tx.expires_at,
        ErrorCode::TransactionExpired
    );
    
    // Check not already executed
    require!(!pending_tx.executed, ErrorCode::AlreadyExecuted);
    
    // Mark as executed
    pending_tx.executed = true;
    
    // Deserialize and execute the instruction
    // (Implementation depends on instruction type)
    
    emit!(TransactionExecutedEvent {
        tx_id: pending_tx.id,
        executor: ctx.accounts.executor.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

**Advantages:**
- ✅ Full control
- ✅ Custom logic possible
- ✅ No external dependencies

**Disadvantages:**
- ⚠️ More complex
- ⚠️ More code to audit
- ⚠️ Need to build UI

---

## 📋 Recommended Approach

### **For Your Project:**

**Phase 1: Launch (Use Squads)**
```
1. Deploy programs with single authority
2. Transfer authority to Squads multi-sig
3. Configure 3-of-5 or 2-of-3 threshold
4. Document all signers
```

**Phase 2: Later (Optional Custom Multi-Sig)**
```
1. Add custom multi-sig if needed
2. More granular control
3. Custom timelock features
4. Emergency procedures
```

---

## 🔧 Implementation Steps

### **Step 1: Create Squads Multi-Sig**

```bash
# Visit https://squads.so/
# Create new multi-sig wallet
# Add team members as signers
# Set threshold (e.g., 3-of-5)
```

### **Step 2: Transfer Program Authority**

```bash
# For each program
solana program set-upgrade-authority \
  <PROGRAM_ID> \
  --new-upgrade-authority <SQUADS_MULTISIG_ADDRESS> \
  --url devnet

# Verify
solana program show <PROGRAM_ID> --url devnet
```

### **Step 3: Update Program Configs**

```bash
# Update tax config authority
# Update vault authorities
# Update distribution authority
# All require multi-sig approval
```

### **Step 4: Document Process**

Create `MULTISIG_OPERATIONS.md`:
```markdown
# Multi-Sig Operations

## Signers
1. Alice - alice@pangi.com
2. Bob - bob@pangi.com
3. Carol - carol@pangi.com
4. Dave - dave@pangi.com
5. Eve - eve@pangi.com

## Threshold: 3-of-5

## Critical Operations Requiring Multi-Sig
- Program upgrades
- Tax rate changes
- Emergency pause
- Authority transfers
- Large fund movements

## Process
1. Create proposal in Squads
2. Share with signers
3. Collect 3+ signatures
4. Execute transaction
5. Document in changelog
```

---

## 🎯 Critical Operations to Protect

### **Token Program:**
- ✅ Update tax rates
- ✅ Change conservation fund
- ✅ Update authority
- ✅ Program upgrades

### **NFT Program:**
- ✅ Change evolution parameters
- ✅ Update authority
- ✅ Program upgrades

### **Vault Program:**
- ✅ Deactivate vault
- ✅ Change reward rates
- ✅ Update authority
- ✅ Program upgrades

### **Distribution Program:**
- ✅ Register special NFTs
- ✅ Deactivate distribution
- ✅ Update authority
- ✅ Program upgrades

---

## 📊 Security Comparison

| Approach | Security | Complexity | Cost | Recommended |
|----------|----------|------------|------|-------------|
| **Single Key** | ⚠️ Low | ✅ Simple | ✅ Free | ❌ No |
| **Squads Multi-Sig** | ✅ High | ✅ Simple | ✅ Free | ✅ Yes |
| **Custom Multi-Sig** | ✅ High | ⚠️ Complex | ⚠️ Dev time | ⚠️ Later |
| **Hardware Wallet** | ✅ Medium | ✅ Simple | 💰 $100-200 | ✅ Yes |
| **Squads + Hardware** | ✅ Very High | ✅ Medium | 💰 $100-200 | ✅ Best |

---

## 🚨 Emergency Procedures

### **If Single Key Compromised:**

**Without Multi-Sig:**
- ❌ Attacker has full control
- ❌ Can drain funds
- ❌ Can modify programs
- ❌ No recovery possible

**With Multi-Sig:**
- ✅ Attacker needs M-of-N keys
- ✅ Other signers can block
- ✅ Can revoke compromised key
- ✅ Funds remain safe

### **Emergency Response Plan:**

```markdown
1. Detect compromise
2. Alert all signers
3. Freeze operations (if possible)
4. Revoke compromised key
5. Add new key
6. Resume operations
7. Post-mortem analysis
```

---

## 💡 Best Practices

### **Key Management:**

1. **Distribute Keys:**
   - Different people
   - Different locations
   - Different devices

2. **Use Hardware Wallets:**
   - Ledger or Trezor
   - For each signer
   - Never expose private keys

3. **Document Everything:**
   - Who has keys
   - Contact information
   - Emergency procedures

4. **Regular Audits:**
   - Review signers quarterly
   - Test emergency procedures
   - Update documentation

### **Operational Security:**

1. **Proposal Process:**
   - Clear description
   - Impact analysis
   - Review period (24-48 hours)
   - Discussion before signing

2. **Execution:**
   - Verify proposal details
   - Check transaction simulation
   - Confirm with team
   - Execute and verify

3. **Monitoring:**
   - Track all proposals
   - Alert on new proposals
   - Log all executions
   - Regular security reviews

---

## 📝 Implementation Checklist

### **Before Mainnet:**

- [ ] Create Squads multi-sig wallet
- [ ] Add all signers (3-5 people)
- [ ] Set threshold (3-of-5 recommended)
- [ ] Test with small transaction
- [ ] Transfer program authorities
- [ ] Update all program configs
- [ ] Document all signers
- [ ] Create emergency procedures
- [ ] Test emergency procedures
- [ ] Train all signers on process

### **After Mainnet:**

- [ ] Monitor all proposals
- [ ] Regular signer reviews
- [ ] Update documentation
- [ ] Quarterly security audits
- [ ] Test emergency procedures annually

---

## 🎉 Summary

**Your current programs already have:**
- ✅ Explicit authority checks
- ✅ Unauthorized error handling
- ✅ Signer validation

**To add multi-sig protection:**
1. Use Squads Protocol (easiest)
2. Transfer authorities to multi-sig
3. Require M-of-N signatures
4. Document process

**Timeline:**
- Setup: 1-2 hours
- Testing: 1 day
- Documentation: 1 day
- **Total: 2-3 days**

**Cost:** Free (Squads is free to use)

---

**Recommendation:** Set up Squads multi-sig before mainnet launch. It's simple, free, and dramatically improves security.
