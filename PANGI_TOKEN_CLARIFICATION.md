# PANGI Token - Role and Custody Model

## Executive Summary

Clarification of PANGI token's role in the ecosystem and its relationship to the Master/Guardian system.

---

## PANGI Token Overview

### What is PANGI Token?

**PANGI Token** is a standard SPL token on Solana with:
- Dynamic tax rates (1%, 0.5%, 2%, 0%)
- Conservation fund mechanism
- Transfer type detection (P2P, Exchange, Whale)
- Safe math operations

### Token Program Authority

```rust
pub struct TaxConfig {
    pub authority: Pubkey,              // Admin who can update tax rates
    pub p2p_tax_rate: u16,              // 1% (100 basis points)
    pub exchange_tax_rate: u16,         // 0.5% (50 basis points)
    pub whale_tax_rate: u16,            // 2% (200 basis points)
    pub whale_transfer_threshold: u64,  // Threshold for whale transfers
    pub max_tax_per_transfer: u64,      // Maximum tax per transaction
    pub conservation_fund: Pubkey,      // Where taxes go
    pub last_updated: i64,
}
```

**Authority Role**:
- ✅ Can update tax rates (within limits)
- ✅ Can update whale threshold
- ✅ Can update conservation fund address
- ❌ **CANNOT** access user token balances
- ❌ **CANNOT** transfer user tokens
- ❌ **CANNOT** freeze user accounts
- ❌ **CANNOT** mint additional tokens (if supply is fixed)

---

## PANGI Token vs Master/Guardian System

### Two Separate Layers

```
┌─────────────────────────────────────────────────────┐
│         Master/Guardian System (Layer 2)            │
│  - Master NFT controls encrypted wallets            │
│  - Guardians have delegated permissions             │
│  - Users control their own keys                     │
│  - PANGI has ZERO access                            │
└────────────────┬────────────────────────────────────┘
                 │ Uses
┌────────────────▼────────────────────────────────────┐
│         PANGI Token (Layer 1)                       │
│  - Standard SPL token                               │
│  - Dynamic tax rates                                │
│  - Conservation fund                                │
│  - Users hold tokens in their wallets               │
│  - PANGI has ZERO access to user balances          │
└─────────────────────────────────────────────────────┘
```

### Integration

**How They Work Together**:

1. **User holds PANGI tokens** in their Solana wallet
2. **Master NFT** controls access to encrypted wallet system
3. **Funds Wallet** (in Master/Guardian system) can hold PANGI tokens
4. **Guardian NFTs** can have permission to transfer PANGI tokens
5. **Token transfers** use PANGI token program (with taxes)

**Example Flow**:
```
User has:
- Master NFT #42 (controls encrypted wallets)
- 10,000 PANGI tokens (in Solana wallet)
- Funds Wallet (encrypted, controlled by Master NFT)

User stores PANGI tokens in Funds Wallet:
1. User (with Master NFT) encrypts wallet data
2. Wallet data includes: "10,000 PANGI at address XYZ"
3. Actual tokens remain in Solana wallet (not encrypted)
4. Encrypted wallet just tracks ownership

Guardian #1 transfers PANGI:
1. Guardian has permission: "Transfer up to 1000 PANGI"
2. Guardian initiates transfer
3. PANGI token program applies tax (1% P2P = 10 PANGI)
4. Net transfer: 990 PANGI to recipient
5. Tax: 10 PANGI to conservation fund
6. Guardian cannot exceed 1000 PANGI limit
```

---

## Custody Model Clarification

### PANGI Token Custody

**Who Holds PANGI Tokens?**
- ✅ **Users** hold tokens in their Solana wallets
- ✅ **Users** control their wallet private keys
- ❌ **PANGI** does NOT hold user tokens
- ❌ **PANGI** does NOT have access to user wallets

**Token Program Authority**:
- ✅ Can update protocol parameters (tax rates)
- ❌ **CANNOT** access user token balances
- ❌ **CANNOT** transfer user tokens
- ❌ **CANNOT** freeze user tokens

**Conservation Fund**:
- ✅ Receives tax from transfers (automatic)
- ✅ Controlled by conservation fund authority
- ✅ Used for conservation efforts
- ❌ **NOT** user funds (only collected taxes)

### Master/Guardian Custody

**Who Controls Encrypted Wallets?**
- ✅ **Users** control via Master NFT
- ✅ **Users** hold Master NFT private keys
- ✅ **Users** have 24-word seed phrase
- ❌ **PANGI** does NOT have access to Master NFTs
- ❌ **PANGI** does NOT have encryption keys
- ❌ **PANGI** does NOT have seed phrases

**Encrypted Wallet Data**:
- ✅ Stored on-chain (Solana blockchain)
- ✅ Encrypted with user's master key
- ✅ Only user can decrypt
- ❌ **PANGI** cannot decrypt
- ❌ **PANGI** cannot access

---

## What PANGI Controls vs What Users Control

### PANGI Controls (Protocol Level)

**Token Program**:
- ✅ Tax rate parameters (within limits)
- ✅ Conservation fund address
- ✅ Whale transfer threshold
- ✅ Protocol logic and rules

**Master/Guardian Program** (when implemented):
- ✅ Protocol rules (subdomain limits)
- ✅ Smart contract logic
- ✅ Upgrade authority (via governance)

**What PANGI Does NOT Control**:
- ❌ User token balances
- ❌ User wallet private keys
- ❌ User Master NFTs
- ❌ User encryption keys
- ❌ User seed phrases
- ❌ User encrypted data

### Users Control (Self-Custody)

**PANGI Tokens**:
- ✅ Token balances in their wallets
- ✅ Wallet private keys
- ✅ When/where to transfer
- ✅ Who to send tokens to

**Master/Guardian System**:
- ✅ Master NFT (holds encryption key)
- ✅ 24-word seed phrase
- ✅ Guardian creation and permissions
- ✅ Encrypted wallet data
- ✅ All wallet contents

**What Users Are Responsible For**:
- ✅ Securing seed phrases
- ✅ Managing Master NFTs
- ✅ Protecting private keys
- ✅ All losses due to lost keys
- ✅ All security of their assets

---

## Tax Collection - How It Works

### Automatic Tax Collection

**When User Transfers PANGI Tokens**:
```
User initiates transfer: 1000 PANGI
↓
PANGI token program calculates tax
↓
Transfer type: P2P (1% tax)
↓
Tax amount: 10 PANGI (1% of 1000)
↓
Net transfer: 990 PANGI to recipient
↓
Tax: 10 PANGI to conservation fund (automatic)
↓
User receives: 990 PANGI
Conservation fund receives: 10 PANGI
```

**Key Points**:
- ✅ Tax collected automatically by smart contract
- ✅ User cannot avoid tax (built into protocol)
- ✅ Tax goes to conservation fund (not PANGI)
- ✅ Transparent and auditable on-chain
- ❌ PANGI does NOT manually collect taxes
- ❌ PANGI does NOT have access to user funds

### Conservation Fund

**What is Conservation Fund?**
- Wallet address that receives taxes
- Controlled by conservation fund authority
- Used for pangolin conservation efforts
- Transparent on-chain

**Who Controls Conservation Fund?**
- ✅ Conservation fund authority (separate from PANGI)
- ✅ Can be multisig for transparency
- ✅ Can be DAO-controlled
- ❌ NOT individual user funds
- ❌ Only collected taxes

---

## Security Implications

### Token Program Security

**Existing Security** (Already Implemented):
- ✅ Safe math operations (overflow protection)
- ✅ Input validation (amount limits)
- ✅ Tax rate limits (max 10%)
- ✅ Authority verification
- ✅ Slippage protection (max_tax_amount)

**User Risks**:
- ⚠️ Tax applied to transfers (expected behavior)
- ⚠️ Whale transfers have higher tax (2%)
- ⚠️ User must approve transactions

**PANGI Risks**: **NONE**
- ✅ PANGI does not hold user tokens
- ✅ PANGI cannot access user balances
- ✅ Tax collection is automatic (smart contract)

### Master/Guardian Security

**User Risks**:
- ⚠️ Lost Master NFT = lost wallet access
- ⚠️ Lost seed phrase = permanent loss
- ⚠️ Compromised Guardian = limited damage
- ⚠️ User responsible for security

**PANGI Risks**: **NONE**
- ✅ PANGI does not hold Master NFTs
- ✅ PANGI cannot decrypt wallets
- ✅ PANGI cannot recover lost keys

---

## Governance and Upgrades

### Token Program Governance

**What Can Be Changed** (via authority):
- ✅ Tax rates (within 0-10% limit)
- ✅ Whale threshold
- ✅ Conservation fund address
- ✅ Max tax per transfer

**What CANNOT Be Changed**:
- ❌ User token balances
- ❌ User wallet ownership
- ❌ Past transactions
- ❌ Token supply (if fixed)

**Governance Process** (Recommended):
```
1. Proposal to change tax rate
   ↓
2. Community discussion
   ↓
3. PANGI token holder vote
   ↓
4. If approved: Authority updates tax rate
   ↓
5. New rate applies to future transfers
```

### Master/Guardian Governance

**What Can Be Changed** (via PANGI.sol):
- ✅ Subdomain limits (unlock reserved slots)
- ✅ Protocol parameters
- ✅ Smart contract upgrades

**What CANNOT Be Changed**:
- ❌ User Master NFTs
- ❌ User encryption keys
- ❌ User wallet contents
- ❌ User permissions (set by Master)

---

## Legal and Compliance

### PANGI's Position

**Token Program**:
```
PANGI provides:
✅ Open-source smart contract
✅ Tax collection mechanism (automatic)
✅ Conservation fund routing

PANGI does NOT:
❌ Hold user tokens
❌ Control user balances
❌ Provide custodial services
❌ Guarantee token value
```

**Master/Guardian Program**:
```
PANGI provides:
✅ Open-source smart contracts
✅ Encryption protocol
✅ Permission system

PANGI does NOT:
❌ Hold user keys
❌ Access user data
❌ Provide recovery services
❌ Act as custodian
```

### User Responsibilities

**For PANGI Tokens**:
- ✅ Secure wallet private keys
- ✅ Understand tax implications
- ✅ Verify transaction details
- ✅ Accept tax deductions

**For Master/Guardian System**:
- ✅ Secure 24-word seed phrase
- ✅ Manage Master NFT safely
- ✅ Set Guardian permissions wisely
- ✅ Accept full responsibility for losses

### Disclaimers Required

```
⚠️ PANGI TOKEN DISCLAIMER ⚠️

PANGI tokens are subject to:
- Dynamic tax rates (1%, 0.5%, 2%, 0%)
- Automatic tax collection
- Conservation fund contributions

By holding/transferring PANGI:
- You accept tax deductions
- You understand taxes are automatic
- You verify transaction details
- PANGI does not hold your tokens

⚠️ MASTER/GUARDIAN DISCLAIMER ⚠️

This is a self-custody system:
- You control your own keys
- PANGI cannot recover lost keys
- PANGI cannot access your data
- You accept all risks
- Lost keys = permanent loss
```

---

## Summary

### PANGI Token

**What It Is**:
- Standard SPL token with dynamic taxes
- Conservation-focused mechanism
- Transparent on-chain operations

**PANGI's Role**:
- ✅ Provides protocol (smart contract)
- ✅ Sets tax parameters (within limits)
- ❌ Does NOT hold user tokens
- ❌ Does NOT access user balances

**User's Role**:
- ✅ Holds tokens in their wallet
- ✅ Controls private keys
- ✅ Accepts tax deductions
- ✅ Responsible for security

### Master/Guardian System

**What It Is**:
- Self-custody wallet management
- NFT-based encryption keys
- Delegated permission system

**PANGI's Role**:
- ✅ Provides protocol (smart contracts)
- ✅ Governs protocol rules
- ❌ Does NOT hold user keys
- ❌ Does NOT access user data

**User's Role**:
- ✅ Controls Master NFT
- ✅ Manages seed phrase
- ✅ Sets Guardian permissions
- ✅ Responsible for all security

### Key Principle

```
PANGI = Protocol Provider
Users = Asset Owners

PANGI provides the tools.
Users control the assets.

Not your keys = Not your crypto
Not your seed phrase = Not your wallet
```

---

## Conclusion

**PANGI Token and Master/Guardian system are both self-custody protocols.**

**PANGI's Liability**: **NONE**
- Does not hold user tokens
- Does not access user data
- Does not provide recovery services
- Provides protocol infrastructure only

**User's Responsibility**: **FULL**
- Controls their own tokens
- Controls their own keys
- Secures their own seed phrases
- Accepts all risks

**This is true decentralization and self-custody.**
