# PANGI Ecosystem - Complete System Overview

## Executive Summary

PANGI is a self-custody NFT ecosystem on Solana featuring:
- **Master/Guardian NFT System**: NFTs as cryptographic keys for encrypted wallets
- **Structured Wallet System**: 5 required + 2 custom + 2 reserved subdomains (max 9)
- **Obsidian Claw Collection**: 3000 NFTs (1500 hatchling/adult pairs)
- **True Self-Custody**: 24-word seed phrase, no recovery services

---

## 1. Master/Guardian System

### Core Concept
NFTs act as cryptographic keys to encrypted shadow wallets with delegated permission system.

### Master NFT
- **Function**: Primary key to encrypted wallet
- **Holds**: Master encryption key (never shared)
- **Can**: Create Guardians, assign new Master, decrypt full wallet
- **Storage**: Can be stored offline (cold wallet)
- **Recovery**: Via 24-word seed phrase

### Guardian NFT
- **Function**: Delegated permissions without master key
- **Receives**: Delegated pass (NOT master key)
- **Can**: Perform assigned tasks only (view, transfer, manage subdomains)
- **Cannot**: Access master key, decrypt full wallet, self-upgrade permissions
- **Updates**: Require Master NFT connection via Wallet Connect

### Key Security Model
```
Master Encryption Key (Master NFT only)
  ↓ one-way derivation (HKDF)
Delegated Pass (Guardian NFT)
  ↓ cannot reverse
Master Key (cryptographically impossible to derive)
```

### 24-Word Seed Phrase
```
Seed Phrase (24 words)
  ↓ derives
Private Key
  ↓ derives
Public Key / Wallet Address
  ↓ controls
Master NFT
  ↓ holds
Master Encryption Key
  ↓ decrypts
Shadow Wallet
```

**User receives at creation**:
1. 24-word seed phrase (BIP39) - MUST BACKUP
2. Private key (derived from seed)
3. Public key / Wallet address (derived from private)
4. Master NFT
5. Master encryption key

**User experience**:
- Daily: Don't need to know wallet address
- Recovery: Import seed phrase, everything restored

### Privacy Model
- Master NFT address (public) ≠ Wallet address (private)
- Wallet holding Master NFT not directly linked on-chain
- Requires signature verification to prove ownership
- Almost impossible to trace without chain analysis

---

## 2. PANGI Wallet Structure

### Governed by PANGI.sol
- **Protocol Authority**: PANGI.sol controls rules, NOT user assets
- **Self-Custody**: Users have complete control via Master NFT
- **No Recovery**: PANGI cannot recover lost Master NFTs or seed phrases

### Wallet Limits (Current v1.0)
- **5 Required Wallets**: Funds, Documents, Collections, Medical, Identification
- **2 Custom Subdomains**: User-defined (business, gaming, etc.)
- **2 Reserved Slots**: For future PANGI.sol upgrades
- **Total**: 7 active + 2 reserved = 9 maximum possible

### Required Wallets

#### 1. Funds Wallet
- Daily transactions, token movements
- SOL, PANGI, SPL tokens, trading NFTs
- Guardian access: Limited (view, transfer up to limit)

#### 2. Documents Wallet
- Legal documents, property titles, insurance policies
- Encrypted storage, timestamped records
- Guardian access: None (Master only)

#### 3. Collections Wallet
- NFT collections, long-term holdings
- Display/showcase, lending protocols
- Guardian access: View only (no transfer)

#### 4. Medical Wallet
- Health records, prescriptions, insurance
- HIPAA-compliant encryption
- Guardian access: None (Master only)

#### 5. Identification Wallet
- Government IDs, biometrics, KYC/AML
- Zero-knowledge proofs for verification
- Guardian access: None (Master only)

#### 6-7. Custom Subdomains
- User-defined purposes
- Examples: Business, Gaming, Investments, Family, Education
- Guardian access: Configurable

#### 8-9. Reserved Slots
- Locked for future use
- Only PANGI.sol can unlock via governance
- Requires protocol upgrade

### Name Registry
Format: `master_nft_id.wallet_type.pangi`

Examples:
- `42.funds.pangi` - Funds wallet for Master NFT #42
- `42.documents.pangi` - Documents wallet
- `42.business.pangi` - Custom subdomain

### Upgrade Path
```
Current (v1.0): 7 active wallets
  ↓ PANGI.sol governance vote
Upgraded (v2.0): 9 active wallets (reserved slots unlocked)
  ↓ Future expansion
Beyond v2.0: Requires new contract upgrade
```

---

## 3. Obsidian Claw NFT Collection

### Collection Structure

**Series 1: Main Collection (3000 NFTs)**
- Part 1: 1500 Hatchlings (trait hints in artwork)
- Part 2: 1500 Adults (full trait reveal)
- Matching pairs: Hatchling #1 ↔ Adult #1501
- No evolution (separate mints)

**Series 2: Special Editions (Flexible)**
- Promotional/marketing NFTs
- Evolution enabled (Egg → Legendary)
- Includes 1-of-1s, orphans, middle stages
- No matching requirements

### Tribes & Lineages
- **Pure**: Obsidian Claw (base lineage)
- **Hybrids**: Azure, Crystal, Cyber, Shadow, Sunscale, Titan, Verdant

### Traits (7 Categories)
1. Scale Type (Volcanic Black, Titan Alloy, Neon Circuit, etc.)
2. Eyes (Runic Red, Data Circuit, Solar Amber, etc.)
3. Tail Type (Standard Coil, Coral Fan, Solar Plume, etc.)
4. Body Markings (Vine Spread, Lava Cracks, Circuit Map, etc.)
5. Aura Effect (Solar Flare, Shadow Drift, Neon Surge, etc.)
6. Background (Shadow Swamp, Volcanic Plains, Neon Abyss, etc.)
7. Lineage (Pure or Hybrid type)

### Rarity Distribution (3000 total)
- Common: 1500 (50%) - 750 pairs
- Uncommon: 1050 (35%) - 525 pairs
- Rare: 300 (10%) - 150 pairs
- Legendary: 150 (5%) - 75 pairs

### Minting Strategy
- **Random minting**: No guarantees of matches or traits
- **Incentive**: Mint multiple to find matches, create Guardians
- **Master/Guardian integration**: First mint = Master, additional = Guardians

---

## 4. Integration: How It All Works Together

### User Journey

**Step 1: Mint First NFT (Master Creation)**
```
User mints Hatchling #42
  ↓
System generates:
  - 24-word seed phrase
  - Private/public keys
  - Master encryption key
  - Encrypted shadow wallet
  ↓
Hatchling #42 = Master NFT
  ↓
User receives seed phrase (MUST BACKUP)
  ↓
7 wallets created:
  - 5 required (Funds, Documents, Collections, Medical, ID)
  - 2 custom (user chooses)
  - 2 reserved (locked)
```

**Step 2: Create Guardians**
```
User mints 5 more NFTs
  ↓
Assigns as Guardians:
  - Guardian #1 (Hatchling #156): View Funds
  - Guardian #2 (Adult #1678): Transfer up to 1000 PANGI
  - Guardian #3 (Hatchling #287): Manage Collections
  - Guardian #4 (Adult #1889): Business subdomain
  - Guardian #5 (Hatchling #391): Gaming subdomain
  ↓
Each Guardian receives delegated pass (NOT master key)
```

**Step 3: Cold Storage**
```
User transfers Master NFT #42 to hardware wallet
  ↓
Stores hardware wallet offline (safe)
  ↓
Master encryption key now in cold storage
  ↓
Uses Guardians for daily operations
  ↓
Only connects Master for critical actions:
  - Creating new Guardians
  - Updating Guardian permissions
  - Accessing Documents/Medical/ID wallets
  - Assigning new Master
```

**Step 4: Matching Pair Strategy**
```
User continues minting to find Adult #1542 (matches Hatchling #42)
  ↓
Mints 15 more NFTs
  ↓
Finally gets Adult #1542 (MATCH!)
  ↓
Option: Assign Adult #1542 as new Master
  ↓
Hatchling #42 becomes regular NFT (can trade)
  ↓
Wallet control retained with Adult #1542
```

### Use Case Examples

**Individual User**:
- Master: Hatchling #42 (cold wallet)
- Guardians: 3 NFTs for daily tasks
- Wallets: All 7 active (5 required + 2 custom)
- Custom: Gaming + Investments

**Family Account**:
- Master: Adult #1542 (parent's cold wallet)
- Guardians: 4 NFTs (spouse + 2 kids + shared)
- Wallets: Family-focused (shared funds, education)
- Custom: Family + Education

**Business Entity**:
- Master: Legendary #445 (founder's cold wallet)
- Guardians: 5 NFTs (CFO, Legal, Marketing, Dev, Operations)
- Wallets: Business-focused
- Custom: Business + Investments

---

## 5. Security Architecture

### Encryption Layers

**Layer 1: Master Encryption**
- Master NFT holds master encryption key
- Decrypts entire shadow wallet
- NEVER shared with Guardians
- NEVER stored on-chain (only hash)

**Layer 2: Wallet-Level Encryption**
- Each wallet (Funds, Documents, etc.) has additional encryption
- Requires Master NFT to access

**Layer 3: Document Encryption**
- Individual documents encrypted separately
- Multiple layers of protection

**Layer 4: Zero-Knowledge Proofs**
- Identity verification without revealing data
- Privacy-preserving authentication

### Permission Hierarchy

```
Master NFT (Full Control)
├── Decrypt entire shadow wallet
├── Access all 7 wallets
├── Create/revoke Guardians
├── Update Guardian permissions
├── Assign new Master
└── Generate delegated passes

Guardian NFT (Limited Scope)
├── Use delegated pass (NOT master key)
├── Access permitted wallets only
├── Perform assigned actions only
├── Cannot access master key
├── Cannot self-upgrade
└── Cannot create other Guardians
```

### Attack Resistance

**Guardian Compromised**:
- Attacker gets delegated pass only
- Cannot derive master key (one-way derivation)
- Cannot access other Guardians' scopes
- Master revokes compromised pass
- Limited damage

**Master Compromised**:
- Attacker gets master encryption key
- Full wallet access
- CRITICAL: Store Master in cold wallet offline

**Multiple Guardians Compromised**:
- Attacker gets multiple delegated passes
- Still cannot derive master key
- Still cannot access Master-only wallets
- Master revokes all compromised passes

---

## 6. Governance & Upgrades

### PANGI.sol Authority

**Controls**:
- ✅ Protocol rules and parameters
- ✅ Subdomain limit increases
- ✅ Wallet structure governance
- ✅ System upgrades and features

**Does NOT Control**:
- ❌ User wallet contents
- ❌ User encryption keys
- ❌ User Master NFTs
- ❌ User funds or documents
- ❌ Wallet recovery

### Upgrade Process

```
1. Proposal submitted to PANGI.sol
   ↓
2. Community discussion period
   ↓
3. Governance vote (PANGI token holders)
   ↓
4. If approved: Protocol upgrade scheduled
   ↓
5. Upgrade executed by PANGI.sol authority
   ↓
6. New limits/features active for all users
```

**Example: Unlock Reserved Slots**
```
Current: 7 active wallets (5 required + 2 custom)
  ↓ Governance vote passes
Upgraded: 9 active wallets (5 required + 4 custom)
  ↓ Users can now create 2 more custom subdomains
```

---

## 7. Critical User Responsibilities

### Backup Requirements

**MUST Backup**:
1. ✅ 24-word seed phrase (write on paper)
2. ✅ Store in fireproof safe
3. ✅ Create second backup (bank vault)
4. ✅ Test recovery with small amount

**NEVER**:
- ❌ Take photo of seed phrase
- ❌ Store in cloud
- ❌ Email to yourself
- ❌ Share with anyone (including PANGI)

### Recovery Test
```
1. Write 24-word seed phrase
2. Send 0.01 SOL to wallet
3. Delete wallet from device
4. Import using seed phrase
5. Verify access to 0.01 SOL
6. Backup confirmed working
```

### Lost Seed Phrase = Permanent Loss
```
No seed phrase
  ↓
Cannot import wallet
  ↓
Cannot access Master NFT
  ↓
Cannot decrypt shadow wallet
  ↓
PERMANENT LOSS
  ↓
PANGI CANNOT HELP
```

---

## 8. Technical Stack

### Smart Contracts
- **Language**: Rust (Anchor framework)
- **Blockchain**: Solana
- **Programs**: 
  - PANGI Token
  - PANGI NFT (Master/Guardian)
  - PANGI Vault (staking)
  - PANGI Distribution

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: HKDF (HMAC-based)
- **Seed Phrase**: BIP39 (24 words)
- **Zero-Knowledge**: For identity verification

### Frontend
- **Framework**: Next.js
- **Wallet Connect**: Solana Wallet Adapter
- **UI**: React components
- **State**: TypeScript SDK

---

## 9. Key Innovations

1. **NFTs as Cryptographic Keys**: NFTs aren't just art, they're functional keys
2. **Delegated Pass System**: Guardians get utility without security risk
3. **Structured Wallet System**: Organized asset management (5+2+2)
4. **Privacy by Design**: Master NFT address ≠ wallet address
5. **True Self-Custody**: No third-party recovery, complete user control
6. **Matching Pair Strategy**: Incentivizes minting, creates utility
7. **Governance-Controlled Expansion**: Protocol can evolve via PANGI.sol

---

## 10. Documentation Index

### Core System Documentation
- **MASTER_GUARDIAN_SYSTEM.md** (1257 lines)
  - Master/Guardian NFT system
  - Delegated pass cryptography
  - 24-word seed phrase recovery
  - Privacy model
  - Security architecture

- **PANGI_WALLET_STRUCTURE.md** (1010 lines)
  - 5+2+2 wallet structure
  - PANGI.sol governance
  - Self-custody model
  - Upgrade path
  - Name registry

### NFT Collection Documentation
- **OBSIDIAN_CLAW_COLLECTION.md** (266 lines)
  - 3000 NFT collection details
  - Tribes and lineages
  - Trait matrix
  - Rarity distribution

- **NFT_COLLECTION_STRUCTURE.md** (215 lines)
  - Series 1 & 2 structure
  - Hatchling/Adult pairs
  - Special editions

- **NFT_IMPLEMENTATION_GUIDE.md** (288 lines)
  - Technical implementation
  - Smart contract integration
  - Metadata structure
  - Minting strategy

### Additional Files
- **Obsidian_Claw_Traits.csv** (3001 rows)
  - Complete trait matrix for 3000 NFTs

---

## 11. Quick Reference

### For Users
- **Backup**: 24-word seed phrase (paper + safe)
- **Daily Use**: Guardians handle routine tasks
- **Security**: Master NFT in cold wallet
- **Recovery**: Import seed phrase
- **Support**: PANGI cannot recover lost keys

### For Developers
- **Language**: Rust (Anchor)
- **Blockchain**: Solana
- **Encryption**: AES-256-GCM, HKDF
- **Frontend**: Next.js, TypeScript
- **Testing**: Comprehensive test suite included

### For Governance
- **Authority**: PANGI.sol
- **Voting**: PANGI token holders
- **Upgrades**: Community-driven
- **Limits**: Can increase subdomain limits
- **Custody**: Cannot access user wallets

---

## 12. Warnings & Disclaimers

```
╔═══════════════════════════════════════════════════════════╗
║                    ⚠️  CRITICAL WARNING ⚠️                 ║
║                                                           ║
║  PANGI is a SELF-CUSTODY protocol.                       ║
║                                                           ║
║  If you lose your 24-WORD SEED PHRASE:                   ║
║  • Your wallet is encrypted forever                      ║
║  • PANGI CANNOT recover it                               ║
║  • Your funds are LOST PERMANENTLY                       ║
║  • Your documents are INACCESSIBLE                       ║
║  • Your Master NFT is GONE                               ║
║                                                           ║
║  PROTECT YOUR SEED PHRASE:                               ║
║  ✓ Write down all 24 words (in order)                    ║
║  ✓ Store in fireproof safe                               ║
║  ✓ Keep backup in bank safe deposit box                  ║
║  ✓ NEVER store digitally (no photos, no cloud)           ║
║  ✓ NEVER share with anyone (including PANGI)             ║
║                                                           ║
║  NOT YOUR KEYS = NOT YOUR CRYPTO                         ║
║  NOT YOUR SEED PHRASE = NOT YOUR WALLET                  ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Conclusion

PANGI creates a comprehensive, secure, self-custodial digital asset management system where:
- NFTs are functional cryptographic keys
- Users maintain complete control and responsibility
- Guardians provide utility without compromising security
- Structured wallets organize digital life
- Privacy is preserved by design
- Protocol can evolve via governance
- True self-custody with no recovery services

**This is not just an NFT collection—it's a complete digital identity and asset management system.**
