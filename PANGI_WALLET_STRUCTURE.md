# PANGI Wallet Structure - Limited Name Registry System

## Overview

PANGI.sol governs a structured wallet system with a maximum of **5 base wallets + 2 custom subdomains** per Master NFT.

## Wallet Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PANGI.sol - Wallet Governor                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Master NFT #42 (Key)                          │ │
│  │  Controls all wallets and subdomains                       │ │
│  └────────────┬───────────────────────────────────────────────┘ │
│               │                                                   │
│               │ Unlocks                                          │
│               │                                                   │
│  ┌────────────▼───────────────────────────────────────────────┐ │
│  │         Encrypted Wallet System (Max 7 Subdomains)         │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  1. FUNDS WALLET (Required)                         │   │ │
│  │  │     • Daily transactions                             │   │ │
│  │  │     • Token movements (PANGI, SOL, SPL tokens)      │   │ │
│  │  │     • NFT transfers                                  │   │ │
│  │  │     • Active trading                                 │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  2. DOCUMENTS WALLET (Required)                     │   │ │
│  │  │     • Property titles (house, land)                 │   │ │
│  │  │     • Insurance policies (auto, home, life)         │   │ │
│  │  │     • Legal documents                                │   │ │
│  │  │     • Contracts & agreements                         │   │ │
│  │  │     • Certificates (birth, marriage, etc.)          │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  3. COLLECTIONS WALLET (Required)                   │   │ │
│  │  │     • NFT collections (art, PFPs, etc.)             │   │ │
│  │  │     • Collectible tokens                             │   │ │
│  │  │     • Digital memorabilia                            │   │ │
│  │  │     • Gaming assets                                  │   │ │
│  │  │     • Long-term NFT holdings                         │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  4. MEDICAL WALLET (Required)                       │   │ │
│  │  │     • Medical records                                │   │ │
│  │  │     • Prescriptions                                  │   │ │
│  │  │     • Health insurance                               │   │ │
│  │  │     • Vaccination records                            │   │ │
│  │  │     • Medical history                                │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  5. IDENTIFICATION WALLET (Required)                │   │ │
│  │  │     • Government IDs (passport, driver's license)   │   │ │
│  │  │     • Social security / national ID                  │   │ │
│  │  │     • Biometric data                                 │   │ │
│  │  │     • Digital identity credentials                   │   │ │
│  │  │     • KYC/AML documents                              │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  6. CUSTOM SUBDOMAIN #1 (Optional)                  │   │ │
│  │  │     • User-defined purpose                           │   │ │
│  │  │     • Examples: Business, Gaming, Investments       │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  7. CUSTOM SUBDOMAIN #2 (Optional)                  │   │ │
│  │  │     • User-defined purpose                           │   │ │
│  │  │     • Examples: Family, Education, Charity          │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  8-9. RESERVED PLACEHOLDERS (Future)                │   │ │
│  │  │     • Reserved for PANGI.sol protocol upgrades       │   │ │
│  │  │     • Cannot be used by users currently              │   │ │
│  │  │     • Requires PANGI.sol governance approval         │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Wallet Specifications

### Maximum Limits
- **Total Subdomains**: 7 maximum (current limit)
- **Required Wallets**: 5 (Funds, Documents, Collections, Medical, Identification)
- **Custom Subdomains**: 2 (optional, user-defined)
- **Reserved Placeholders**: 2 (for future PANGI.sol upgrades)
- **Governed by**: PANGI.sol smart contract (only authority that can increase limits)

**Important**: Only PANGI.sol can increase subdomain limits through protocol upgrades. Users cannot exceed current limits.

### 1. Funds Wallet (Required)

**Purpose**: Daily financial operations and active asset management

**Contents**:
- SOL (native Solana)
- PANGI tokens
- Other SPL tokens
- NFTs for trading
- Active liquidity

**Permissions**:
- ✅ High-frequency transactions
- ✅ Token swaps
- ✅ NFT trading
- ✅ DeFi interactions
- ✅ Guardian access (with limits configured by Master)

**Guardian Configuration** (Master-Installed):
```
guardian_config/
├── transfer_limits: 1000 PANGI per transaction
├── daily_limit: 5000 PANGI
├── allowed_operations: ["transfer", "swap", "nft_trade"]
├── reporting_destination: "public_address_xyz"
├── report_on: ["large_transfer", "daily_summary"]
└── no_inbound_data: true  # Guardian reports OUT only
```

**Security Level**: Medium (active use)

**Example Structure**:
```
funds/
├── sol_balance: 10.5 SOL
├── pangi_balance: 50,000 PANGI
├── usdc_balance: 1,000 USDC
├── active_nfts/
│   ├── trading_nft_1.json
│   └── trading_nft_2.json
├── transaction_history/
└── guardian_reports/  # Reports sent OUT by Guardian
    ├── report_2024_01_15.json
    └── report_2024_01_16.json
```

### 2. Documents Wallet (Required)

**Purpose**: Legal and official document storage

**Contents**:
- Property titles (house, land, vehicles)
- Insurance policies (home, auto, life, health)
- Legal contracts
- Agreements and deeds
- Certificates (birth, marriage, death)
- Educational diplomas
- Professional licenses

**Permissions**:
- ❌ No Guardian access (Master only)
- ✅ Read-only for authorized parties
- ✅ Encrypted storage
- ✅ Timestamped records

**Security Level**: High (sensitive documents)

**Example Structure**:
```
documents/
├── property/
│   ├── house_title_123_main_st.pdf.enc
│   ├── car_title_tesla_model3.pdf.enc
│   └── land_deed_plot_456.pdf.enc
├── insurance/
│   ├── home_insurance_policy.pdf.enc
│   ├── auto_insurance_policy.pdf.enc
│   └── life_insurance_policy.pdf.enc
├── legal/
│   ├── will_testament.pdf.enc
│   ├── power_of_attorney.pdf.enc
│   └── trust_documents.pdf.enc
└── certificates/
    ├── birth_certificate.pdf.enc
    ├── marriage_certificate.pdf.enc
    └── university_diploma.pdf.enc
```

### 3. Collections Wallet (Required)

**Purpose**: Long-term NFT and collectible storage

**Contents**:
- NFT art collections
- PFP (Profile Picture) NFTs
- Gaming assets
- Digital collectibles
- Rare/valuable NFTs
- Sentimental NFTs

**Permissions**:
- ✅ Guardian view access
- ❌ Guardian transfer (Master only)
- ✅ Display/showcase
- ✅ Lending protocols

**Security Level**: High (valuable assets)

**Example Structure**:
```
collections/
├── art/
│   ├── obsidian_claw_pangopup_42.json
│   ├── obsidian_claw_adult_1542.json
│   ├── legendary_cyber_445.json
│   └── rare_crystal_287.json
├── pfp/
│   ├── main_avatar.json
│   └── alt_avatars/
├── gaming/
│   ├── game_item_1.json
│   └── game_character_1.json
└── metadata/
    ├── collection_stats.json
    └── rarity_rankings.json
```

### 4. Medical Wallet (Required)

**Purpose**: Health records and medical information storage

**Contents**:
- Medical records
- Prescriptions
- Lab results
- Vaccination records
- Health insurance
- Medical history
- Allergy information
- Emergency contacts

**Permissions**:
- ❌ No Guardian access (Master only)
- ✅ Emergency access (with conditions)
- ✅ Healthcare provider access (authorized)
- ✅ HIPAA-compliant encryption

**Security Level**: Maximum (protected health information)

**Example Structure**:
```
medical/
├── records/
│   ├── medical_history.json.enc
│   ├── current_medications.json.enc
│   └── allergies.json.enc
├── prescriptions/
│   ├── prescription_2024_01.pdf.enc
│   └── prescription_2024_02.pdf.enc
├── insurance/
│   ├── health_insurance_card.pdf.enc
│   └── insurance_policy.pdf.enc
├── vaccinations/
│   ├── covid_vaccine_record.pdf.enc
│   └── childhood_vaccines.pdf.enc
└── emergency/
    ├── emergency_contacts.json.enc
    └── blood_type_info.json.enc
```

### 5. Identification Wallet (Required)

**Purpose**: Identity verification and credentials

**Contents**:
- Government-issued IDs
- Passport
- Driver's license
- Social security card / National ID
- Biometric data
- Digital identity credentials
- KYC/AML verification
- Citizenship documents

**Permissions**:
- ❌ No Guardian access (Master only)
- ✅ Verification services (authorized)
- ✅ Zero-knowledge proofs (privacy-preserving)
- ✅ Selective disclosure

**Security Level**: Maximum (identity theft prevention)

**Example Structure**:
```
identification/
├── government_ids/
│   ├── passport.pdf.enc
│   ├── drivers_license.pdf.enc
│   └── national_id.pdf.enc
├── biometric/
│   ├── fingerprint_hash.enc
│   ├── facial_recognition_data.enc
│   └── iris_scan_data.enc
├── digital_identity/
│   ├── did_document.json.enc
│   ├── verifiable_credentials.json.enc
│   └── kyc_verification.json.enc
└── citizenship/
    ├── birth_certificate.pdf.enc
    └── citizenship_papers.pdf.enc
```

### 6 & 7. Custom Subdomains (Optional)

**Purpose**: User-defined organization

**Common Use Cases**:

**Business Subdomain**:
```
business/
├── company_documents/
├── business_contracts/
├── tax_records/
├── invoices/
└── business_nfts/
```

**Gaming Subdomain**:
```
gaming/
├── game_assets/
├── in_game_currency/
├── achievement_nfts/
├── guild_memberships/
└── tournament_records/
```

**Investment Subdomain**:
```
investments/
├── portfolio_tokens/
├── staking_positions/
├── defi_positions/
├── investment_nfts/
└── yield_farming/
```

**Staking Subdomain** (Self-Custody Mandatory Reporting):
```
staking/
├── staked_pangi_tokens/
├── lock_duration_config/
├── guardian_reporting_config/    # Master installs this
│   ├── report_destination: "public_reward_address"
│   ├── reporting_frequency: "on_unlock"
│   ├── report_format: "unlock_event"
│   └── no_inbound_data: true     # Guardian reports OUT only
├── stake_positions/
└── reward_history/
```

**Family Subdomain**:
```
family/
├── shared_documents/
├── family_photos_nfts/
├── inheritance_plans/
├── family_trust/
└── shared_collections/
```

**Education Subdomain**:
```
education/
├── course_certificates/
├── academic_transcripts/
├── research_papers/
├── educational_nfts/
└── student_credentials/
```

## Critical: Self-Custody & No Recovery

### PANGI.sol Authority vs User Custody

**PANGI.sol is the ROOT authority for**:
- ✅ Protocol rules and parameters
- ✅ Subdomain limit increases
- ✅ Wallet structure governance
- ✅ System upgrades and features
- ✅ Smart contract logic

**PANGI.sol has ZERO authority over**:
- ❌ User wallet contents
- ❌ User encryption keys
- ❌ User Master NFTs
- ❌ User documents or funds
- ❌ Wallet recovery
- ❌ Guardian reporting data (Guardian reports OUT only)
- ❌ Inbound data to Guardians (no data sent from PANGI to Guardians)

### Self-Custody Model

**Users have COMPLETE control**:
- ✅ Master NFT = User's key
- ✅ Encryption keys = User's responsibility
- ✅ Wallet access = User's Master NFT
- ✅ Recovery = User's backup strategy
- ✅ Security = User's cold storage

**PANGI CANNOT and WILL NOT**:
- ❌ Recover lost Master NFTs
- ❌ Decrypt user wallets
- ❌ Access user documents
- ❌ Retrieve user funds
- ❌ Reset user passwords/keys
- ❌ Provide wallet recovery services

### User Responsibility

**If Master NFT is lost**:
```
Master NFT lost/stolen/destroyed
↓
Wallet remains encrypted forever
↓
NO RECOVERY POSSIBLE
↓
User loses access permanently
```

**PANGI's position**: "Not your keys, not your crypto" - We cannot help if you lose your Master NFT.

### Cold Storage Strategy (Recommended)

**Setup Process**:
```
1. Mint Master NFT
   ↓
2. Create Guardian NFTs for daily operations
   ↓
3. Master installs Guardian reporting configuration
   ↓
4. Assign Guardian permissions and reporting rules
   ↓
5. Configure public address for Guardian reports
   ↓
6. Transfer Master NFT to cold wallet (hardware wallet)
   ↓
7. Store cold wallet securely offline
   ↓
8. Use Guardians for day-to-day activities
   ↓
9. Guardians report OUT to configured public address
   ↓
10. Only access Master NFT for critical changes
```

**Benefits**:
- ✅ Master NFT safe offline
- ✅ Guardians handle daily tasks
- ✅ Guardians report OUT only (no inbound data)
- ✅ Reduced exposure to theft/loss
- ✅ User maintains full control
- ✅ No third-party custody
- ✅ Self-custody mandatory reporting

**Example**:
```
User stores Master NFT #42 in Ledger hardware wallet
↓
Ledger stored in safe deposit box
↓
Master configured Guardian reporting:
  - Report destination: public_reward_address_xyz
  - Report frequency: on_unlock, daily_summary
  - No inbound data: true
↓
Guardian #1 (hot wallet): View balances, transfer up to 1000 PANGI
  └── Reports OUT to public_reward_address_xyz
Guardian #2 (hot wallet): Manage Collections display
  └── Reports OUT collection changes
Guardian #3 (hot wallet): Monitor staking, report unlocks
  └── Reports OUT unlock events to reward address
↓
Master NFT only needed for:
  - Creating new Guardians
  - Updating Guardian reporting configuration
  - Assigning new Master
  - Accessing Documents/Medical/ID wallets
  - Major fund movements
```

### Recovery Options (User-Controlled)

**Option 1: Master NFT Backup**
```
User backs up Master NFT private key
↓
Stores backup in secure location (safe, vault)
↓
If device lost: Import Master NFT from backup
↓
User regains access
```

**Option 2: Multi-Signature Master**
```
User creates 2-of-3 multisig Master NFT
↓
Distributes keys to trusted parties
↓
If one key lost: Use other 2 keys to recover
↓
User regains access
```

**Option 3: Dead Man's Switch**
```
User sets up time-locked Guardian promotion
↓
If Master NFT not accessed for X months
↓
Guardian automatically promoted to Master
↓
Heir/beneficiary gains access
```

**IMPORTANT**: All recovery options are USER-CONTROLLED. PANGI has no role in recovery.

## PANGI.sol Governance

### Smart Contract Structure

```rust
#[account]
pub struct PangiWalletSystem {
    pub master_nft: Pubkey,                    // Master NFT controlling system
    pub wallet_count: u8,                      // Current wallet count (max 7)
    pub max_allowed_wallets: u8,               // Max wallets (upgradeable by PANGI.sol)
    pub required_wallets: [Wallet; 5],         // 5 required wallets
    pub custom_subdomains: [Option<Wallet>; 2], // 2 optional custom (current)
    pub reserved_slots: [Option<Wallet>; 2],   // 2 reserved for future upgrades
    pub created_at: i64,
    pub last_modified: i64,
    pub pangi_authority: Pubkey,               // PANGI.sol upgrade authority
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Wallet {
    pub name: String,                          // Wallet name
    pub wallet_type: WalletType,               // Type enum
    pub encrypted_data: Vec<u8>,               // Encrypted contents
    pub permissions: Vec<Permission>,          // Access permissions
    pub created_at: i64,
    pub size_bytes: u64,                       // Storage size
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum WalletType {
    Funds,           // Required
    Documents,       // Required
    Collections,     // Required
    Medical,         // Required
    Identification,  // Required
    Custom(String),  // Optional (max 2)
}
```

### Initialization

```rust
pub fn initialize_wallet_system(
    ctx: Context<InitializeWalletSystem>,
    master_nft: Pubkey,
) -> Result<()> {
    let wallet_system = &mut ctx.accounts.wallet_system;
    
    // Create 5 required wallets
    wallet_system.required_wallets = [
        Wallet::new(WalletType::Funds),
        Wallet::new(WalletType::Documents),
        Wallet::new(WalletType::Collections),
        Wallet::new(WalletType::Medical),
        Wallet::new(WalletType::Identification),
    ];
    
    wallet_system.master_nft = master_nft;
    wallet_system.wallet_count = 5;
    wallet_system.custom_subdomains = [None, None];
    wallet_system.created_at = Clock::get()?.unix_timestamp;
    
    Ok(())
}
```

### Add Custom Subdomain

```rust
pub fn add_custom_subdomain(
    ctx: Context<AddCustomSubdomain>,
    subdomain_name: String,
) -> Result<()> {
    let wallet_system = &mut ctx.accounts.wallet_system;
    
    // Verify Master NFT ownership
    require!(
        ctx.accounts.master_nft_holder.key() == wallet_system.master_nft,
        ErrorCode::Unauthorized
    );
    
    // Check current limit (max 2 custom for users)
    require!(
        wallet_system.wallet_count < 7,
        ErrorCode::MaxSubdomainsReached
    );
    
    // Find empty slot in custom subdomains (not reserved slots)
    for slot in wallet_system.custom_subdomains.iter_mut() {
        if slot.is_none() {
            *slot = Some(Wallet::new(WalletType::Custom(subdomain_name)));
            wallet_system.wallet_count += 1;
            return Ok(());
        }
    }
    
    Err(ErrorCode::MaxSubdomainsReached.into())
}
```

### Upgrade Subdomain Limit (PANGI.sol Only)

```rust
pub fn upgrade_subdomain_limit(
    ctx: Context<UpgradeSubdomainLimit>,
    new_max: u8,
) -> Result<()> {
    let wallet_system = &mut ctx.accounts.wallet_system;
    
    // ONLY PANGI.sol authority can upgrade
    require!(
        ctx.accounts.pangi_authority.key() == wallet_system.pangi_authority,
        ErrorCode::UnauthorizedUpgrade
    );
    
    // Validate new limit
    require!(
        new_max > wallet_system.max_allowed_wallets,
        ErrorCode::InvalidUpgrade
    );
    
    require!(
        new_max <= 9, // Hard cap: 5 required + 2 custom + 2 reserved
        ErrorCode::ExceedsHardCap
    );
    
    wallet_system.max_allowed_wallets = new_max;
    wallet_system.last_modified = Clock::get()?.unix_timestamp;
    
    emit!(SubdomainLimitUpgraded {
        old_limit: wallet_system.max_allowed_wallets,
        new_limit: new_max,
        upgraded_at: wallet_system.last_modified,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct UpgradeSubdomainLimit<'info> {
    #[account(mut)]
    pub wallet_system: Account<'info, PangiWalletSystem>,
    
    /// PANGI.sol authority - ONLY this can upgrade
    pub pangi_authority: Signer<'info>,
}
```

## Upgrade Path & Future Expansion

### Current State (v1.0)
- **5 Required Wallets**: Fixed
- **2 Custom Subdomains**: User-accessible
- **2 Reserved Slots**: Locked for future use
- **Total**: 7 active + 2 reserved = 9 maximum possible

### Future Upgrade Scenarios

**Scenario 1: PANGI.sol enables 1 reserved slot**
```
PANGI.sol governance vote passes
↓
Protocol upgrade executed
↓
max_allowed_wallets: 7 → 8
↓
Users can now create 3 custom subdomains
```

**Scenario 2: PANGI.sol enables both reserved slots**
```
PANGI.sol governance vote passes
↓
Protocol upgrade executed
↓
max_allowed_wallets: 7 → 9
↓
Users can now create 4 custom subdomains
```

**Scenario 3: Future expansion beyond 9**
```
Requires:
1. PANGI.sol governance approval
2. Smart contract upgrade
3. New reserved slots added
4. Migration of existing wallets
```

### Upgrade Authority

**Only PANGI.sol can**:
- ✅ Increase subdomain limits
- ✅ Unlock reserved slots
- ✅ Add new wallet types
- ✅ Modify protocol parameters

**Users cannot**:
- ❌ Exceed current limits
- ❌ Access reserved slots
- ❌ Modify protocol rules
- ❌ Create more than 2 custom subdomains (currently)

### Governance Process

```
1. Proposal submitted to PANGI.sol
   ↓
2. Community discussion period
   ↓
3. Governance vote (token holders)
   ↓
4. If approved: Protocol upgrade scheduled
   ↓
5. Upgrade executed by PANGI.sol authority
   ↓
6. New limits active for all users
```

## Name Registry System

### Limited Namespace

**Structure**: `master_nft_id.wallet_type.pangi`

**Current Examples (v1.0)**:
```
42.funds.pangi           → Funds wallet for Master NFT #42
42.documents.pangi       → Documents wallet for Master NFT #42
42.collections.pangi     → Collections wallet for Master NFT #42
42.medical.pangi         → Medical wallet for Master NFT #42
42.identification.pangi  → Identification wallet for Master NFT #42
42.business.pangi        → Custom subdomain #1
42.gaming.pangi          → Custom subdomain #2
42.reserved1.pangi       → LOCKED (reserved for future)
42.reserved2.pangi       → LOCKED (reserved for future)
```

**After Upgrade (hypothetical v2.0)**:
```
42.investments.pangi     → Custom subdomain #3 (unlocked)
42.charity.pangi         → Custom subdomain #4 (unlocked)
```

### Registry Contract

```rust
#[account]
pub struct NameRegistry {
    pub master_nft: Pubkey,
    pub names: Vec<RegisteredName>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisteredName {
    pub name: String,              // e.g., "42.funds.pangi"
    pub wallet_address: Pubkey,    // Encrypted wallet address
    pub wallet_type: WalletType,
    pub registered_at: i64,
}
```

## Access Control Matrix

| Wallet Type      | Master | Guardian (View) | Guardian (Transfer) | Public |
|------------------|--------|-----------------|---------------------|--------|
| Funds            | ✅ Full | ✅ Yes          | ⚠️ Limited          | ❌ No  |
| Documents        | ✅ Full | ❌ No           | ❌ No               | ❌ No  |
| Collections      | ✅ Full | ✅ Yes          | ❌ No               | ✅ Display |
| Medical          | ✅ Full | ❌ No           | ❌ No               | ❌ No  |
| Identification   | ✅ Full | ❌ No           | ❌ No               | ⚠️ ZK Proof |
| Custom #1        | ✅ Full | ⚠️ Configurable | ⚠️ Configurable     | ⚠️ Configurable |
| Custom #2        | ✅ Full | ⚠️ Configurable | ⚠️ Configurable     | ⚠️ Configurable |

## Storage & Encryption

### Encryption Layers

1. **Master Encryption**: All wallets encrypted with Master NFT key
2. **Wallet-Level Encryption**: Each wallet has additional encryption
3. **Document Encryption**: Individual documents encrypted separately
4. **Zero-Knowledge Proofs**: For identity verification without exposure

### Storage Limits

```rust
const MAX_WALLET_SIZE: u64 = 100_000_000; // 100 MB per wallet
const MAX_DOCUMENT_SIZE: u64 = 10_000_000; // 10 MB per document
const MAX_TOTAL_STORAGE_V1: u64 = 700_000_000; // 700 MB (7 active wallets × 100 MB)
const MAX_TOTAL_STORAGE_V2: u64 = 900_000_000; // 900 MB (if upgraded to 9 wallets)

// Storage is upgradeable by PANGI.sol
pub fn get_max_storage(wallet_system: &PangiWalletSystem) -> u64 {
    wallet_system.max_allowed_wallets as u64 * MAX_WALLET_SIZE
}
```

## Use Case Examples

### Example 1: Individual User

```
Master NFT: Pangopup #42

Wallets:
1. Funds: 10 SOL, 50K PANGI, trading NFTs
2. Documents: House title, car title, insurance policies
3. Collections: 15 Obsidian Claw NFTs, 5 art pieces
4. Medical: Health records, prescriptions, insurance
5. Identification: Passport, driver's license, SSN
6. Gaming (Custom): Game assets, achievements
7. Business (Custom): LLC documents, contracts

Guardians:
- Guardian #1: View Funds, Transfer up to 1000 PANGI
- Guardian #2: View Collections, No transfer
```

### Example 2: Family Account

```
Master NFT: Adult #1542

Wallets:
1. Funds: Family budget, shared expenses
2. Documents: Property deeds, family insurance
3. Collections: Family NFT collection
4. Medical: Family health records (encrypted per member)
5. Identification: Family member IDs
6. Family (Custom): Shared photos, memories
7. Education (Custom): Kids' school records

Guardians:
- Spouse Guardian: Full Funds access
- Child Guardian #1: View Collections only
- Child Guardian #2: View Collections only
```

### Example 3: Business Entity

```
Master NFT: Legendary #445

Wallets:
1. Funds: Business operating capital
2. Documents: Business licenses, contracts
3. Collections: Company NFT assets
4. Medical: Employee health plans (aggregated)
5. Identification: Business registration, EIN
6. Business (Custom): Client contracts, invoices
7. Investments (Custom): Company investments, stakes

Guardians:
- CFO Guardian: Full Funds access
- Legal Guardian: Documents access
- Marketing Guardian: Collections management
```

## Migration & Backup

### Backup Strategy

```
Master NFT #42 Backup:
├── encrypted_master_key.backup
├── wallet_structure.json
├── funds_wallet.backup.enc
├── documents_wallet.backup.enc
├── collections_wallet.backup.enc
├── medical_wallet.backup.enc
├── identification_wallet.backup.enc
├── custom_1_wallet.backup.enc
└── custom_2_wallet.backup.enc
```

### Recovery Process (USER-INITIATED ONLY)

**PANGI CANNOT HELP WITH RECOVERY**

User must have:
- ✅ Master NFT (physical possession)
- ✅ Master NFT private key backup
- ✅ Recovery phrase (if using seed phrase backup)
- ✅ Wallet backup files (optional, for data recovery)

**Recovery Steps (User performs alone)**:
1. Locate Master NFT or import from backup
2. Verify Master NFT ownership in wallet
3. Decrypt master key with user's recovery phrase
4. Restore wallet structure from user's backup
5. Decrypt individual wallets using Master NFT
6. Verify data integrity
7. Restore name registry entries

**If user loses Master NFT and has no backup**:
- ❌ Wallet is permanently encrypted
- ❌ No recovery possible
- ❌ PANGI cannot help
- ❌ Funds/documents lost forever

**User Responsibility Disclaimer**:
```
⚠️ WARNING ⚠️

PANGI is a self-custody protocol. We do NOT:
- Store your Master NFT
- Hold your encryption keys
- Have access to your wallets
- Provide recovery services
- Act as custodian

YOU are responsible for:
- Securing your Master NFT
- Backing up your keys
- Storing recovery phrases
- Protecting your assets

LOST MASTER NFT = LOST ACCESS FOREVER
```

## Compliance & Privacy

### Regulatory Compliance

- **HIPAA**: Medical wallet encryption
- **GDPR**: Right to erasure, data portability
- **KYC/AML**: Identification wallet verification
- **SOC 2**: Security controls and auditing

### Privacy Features

- **Zero-Knowledge Proofs**: Verify identity without revealing data
- **Selective Disclosure**: Share specific documents only
- **Encrypted Storage**: All data encrypted at rest
- **Access Logs**: Audit trail of all access

## Custody Model Summary

### PANGI.sol Role (Protocol Governance)
```
┌─────────────────────────────────────┐
│         PANGI.sol (Root)            │
│                                     │
│  Controls:                          │
│  • Protocol rules                   │
│  • Subdomain limits                 │
│  • System upgrades                  │
│  • Smart contract logic             │
│                                     │
│  Does NOT control:                  │
│  • User wallets                     │
│  • User keys                        │
│  • User funds                       │
│  • User documents                   │
│  • Recovery services                │
└─────────────────────────────────────┘
```

### User Role (Self-Custody)
```
┌─────────────────────────────────────┐
│         User (Owner)                │
│                                     │
│  Controls:                          │
│  • Master NFT                       │
│  • Encryption keys                  │
│  • Wallet contents                  │
│  • Guardian permissions             │
│  • Recovery strategy                │
│                                     │
│  Responsible for:                   │
│  • Securing Master NFT              │
│  • Backing up keys                  │
│  • Cold storage                     │
│  • Guardian management              │
│  • Loss prevention                  │
└─────────────────────────────────────┘
```

### Key Principles

1. **Self-Custody**: Users own and control their wallets completely
2. **No Recovery**: PANGI cannot recover lost Master NFTs or wallets
3. **User Responsibility**: Users must secure their own Master NFTs
4. **Cold Storage**: Master NFTs can be stored offline for maximum security
5. **Guardian System**: Enables daily operations without exposing Master NFT
6. **Protocol Governance**: PANGI.sol governs rules, not user assets

## Conclusion

The PANGI wallet structure provides:
- **Organization**: 5 required + 2 custom + 2 reserved wallets
- **Security**: Multi-layer encryption, cold storage support
- **Privacy**: Sensitive data protection, zero-knowledge proofs
- **Flexibility**: Custom subdomains, Guardian delegation
- **Self-Custody**: Complete user control, no third-party access
- **No Recovery**: User responsibility, PANGI cannot help with lost keys
- **Governance**: PANGI.sol controls protocol, not user assets
- **Compliance**: HIPAA, GDPR, KYC/AML compatible

**This creates a comprehensive, secure, self-custodial digital asset management system where users maintain complete control and responsibility.**

### Final Warning

```
╔═══════════════════════════════════════════════════════════╗
║                    ⚠️  CRITICAL WARNING ⚠️                 ║
║                                                           ║
║  PANGI is a SELF-CUSTODY protocol.                       ║
║                                                           ║
║  If you lose your Master NFT:                            ║
║  • Your wallet is encrypted forever                      ║
║  • PANGI CANNOT recover it                               ║
║  • Your funds are LOST PERMANENTLY                       ║
║  • Your documents are INACCESSIBLE                       ║
║                                                           ║
║  PROTECT YOUR MASTER NFT:                                ║
║  ✓ Store in cold wallet (hardware wallet)                ║
║  ✓ Keep backup of private keys                           ║
║  ✓ Use Guardians for daily operations                    ║
║  ✓ Never share your Master NFT                           ║
║                                                           ║
║  NOT YOUR KEYS = NOT YOUR CRYPTO                         ║
╚═══════════════════════════════════════════════════════════╝
```
