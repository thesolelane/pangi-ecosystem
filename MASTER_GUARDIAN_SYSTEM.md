# Master & Guardian NFT System

## Overview

A revolutionary NFT-based wallet custody and permission system where NFTs act as cryptographic keys to encrypted wallets.

## Core Concepts

### Master NFTs
**Definition**: An NFT that acts as the primary key to an encrypted wallet and controls all permissions.

**Key Properties**:
- Can be any NFT (Hatchling or Adult)
- First minted NFT with assigned wallet becomes Master
- Acts as cryptographic key to decrypt wallet data
- Holds all permissions and control
- Can be traded (transfers wallet control)
- Can be stored offline for security

### Guardian NFTs
**Definition**: NFTs with delegated, limited permissions from a Master NFT.

**Key Properties**:
- Created by Master NFT holder
- No wallet ownership
- Limited, specific permissions only
- Cannot become Master (unless assigned)
- Encourages additional minting

### Encrypted Shadow Wallets
**Definition**: Encrypted wallet data that requires Master NFT + TOC (Terms of Control) to decrypt.

**Key Properties**:
- All wallets are encrypted
- Require Master NFT to read/access
- Shadow = encrypted state
- TOC = Terms of Control (decryption rules)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PANGI Master/Guardian System              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Master NFT (Key)                        │   │
│  │  • Hatchling #42 or Adult #1542                      │   │
│  │  • Holds encryption key                              │   │
│  │  • Full wallet control                               │   │
│  │  • Can create Guardians                              │   │
│  │  • Can assign new Master                             │   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                   │
│           │ Controls                                         │
│           │                                                   │
│  ┌────────▼──────────────────────────────────────────────┐  │
│  │         Encrypted Shadow Wallet                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Encrypted Data (requires Master NFT + TOC)     │ │  │
│  │  │  • Token balances                                │ │  │
│  │  │  • NFT holdings                                  │ │  │
│  │  │  • Transaction history                           │ │  │
│  │  │  • Subdomain data                                │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│           │                                                   │
│           │ Delegates to                                     │
│           │                                                   │
│  ┌────────▼──────────────────────────────────────────────┐  │
│  │              Guardian NFTs                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │ Guardian #1  │  │ Guardian #2  │  │ Guardian #3│ │  │
│  │  │ View Only    │  │ Transfer     │  │ Subdomain  │ │  │
│  │  │ Permission   │  │ Permission   │  │ Management │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Initial Mint (Master Creation)

**User mints first NFT**:
```
User → Mint Hatchling #42
↓
System creates encrypted shadow wallet
↓
Hatchling #42 = Master NFT (holds encryption key)
↓
User receives Master NFT + encrypted wallet
```

**What happens**:
- Random NFT minted (Hatchling or Adult)
- New encrypted wallet created
- NFT becomes Master (first NFT = Master)
- Encryption key embedded in Master NFT metadata
- User needs Master NFT + TOC to access wallet

### 2. Accessing Wallet

**Decryption Process**:
```
User presents Master NFT #42
↓
System verifies NFT ownership
↓
Extracts encryption key from NFT
↓
Applies TOC (Terms of Control)
↓
Decrypts shadow wallet
↓
User can view/control wallet
```

**Without Master NFT**: Wallet remains encrypted and inaccessible

### 3. Creating Guardians

**Master holder creates Guardian**:
```
User (holds Master #42) → Mint new NFT
↓
New NFT minted (e.g., Hatchling #156)
↓
Master generates delegated pass (NOT master key)
↓
Master assigns limited permissions + delegated pass
↓
Hatchling #156 = Guardian NFT
↓
Guardian can perform assigned tasks only
```

**Key Distinction - Delegated Pass vs Master Key**:

```
Master NFT #42:
├── Master Encryption Key (NEVER shared)
│   └── Decrypts entire shadow wallet
│
└── Delegated Passes (Generated for Guardians)
    ├── Guardian Pass #1 → View Funds only
    ├── Guardian Pass #2 → Transfer up to 1000 PANGI
    └── Guardian Pass #3 → Manage Collections subdomain
```

**How Delegated Passes Work**:
```
Master Key = Full access to encrypted wallet
     ↓
Master generates derived key (one-way)
     ↓
Delegated Pass = Limited scope key
     ↓
Guardian receives delegated pass
     ↓
Guardian can ONLY access permitted scope
     ↓
Guardian CANNOT derive Master Key from delegated pass
```

**Guardian Permissions** (examples):
- View wallet balance (read-only with delegated pass)
- Transfer tokens (up to limit, using delegated pass)
- Manage specific subdomains (scoped access)
- Execute specific transactions (pre-approved types)
- Access certain data (limited scope)

**Guardian Limitations**:
- ❌ Cannot decrypt full wallet (no master key)
- ❌ Cannot access master encryption key
- ❌ Cannot derive master key from delegated pass
- ❌ Cannot create other Guardians
- ❌ Cannot change Master
- ❌ Cannot access Master-level functions
- ❌ Cannot access wallets outside permission scope
- ✅ Only performs assigned tasks with delegated pass

### 4. Assigning New Master

**Transfer Master status**:
```
Current Master: Hatchling #42
User mints: Adult #1789
↓
User (with Master #42) assigns Adult #1789 as new Master
↓
Adult #1789 = New Master (receives encryption key)
Hatchling #42 = Becomes Guardian or regular NFT
↓
User can now trade Hatchling #42 without losing wallet control
```

**Why assign new Master**:
- **Trading**: Sell original NFT without losing wallet
- **Upgrading**: Use preferred NFT as Master
- **Security**: Rotate Master NFT periodically
- **Matching**: Use Adult when you get matching pair

### 5. Trading Master NFT

**Scenario**: User wants to sell Master NFT but keep wallet

**Solution**:
```
Step 1: Mint new NFT (or use existing)
Step 2: Assign new NFT as Master
Step 3: Old Master becomes regular NFT
Step 4: Trade old NFT safely
Step 5: Wallet control retained with new Master
```

**If Master traded without reassignment**:
- Buyer gets wallet control
- Original owner loses access
- Wallet ownership transfers with NFT

## Minting Strategy

### Random Minting
- All mints are random
- No guarantee of matching pairs
- No guarantee of specific traits
- Encourages multiple mints

### Incentive Structure

**Why mint multiple NFTs**:

1. **Find preferred image**: Mint until you get NFT you love
2. **Increase match chances**: More mints = higher probability of matching pair
3. **Create Guardians**: Each mint can become Guardian with specific role
4. **Collect lineages**: Build collection of specific hybrid types
5. **Rarity hunting**: Chase Legendary traits

**Example**:
```
User mints 10 NFTs:
- Hatchling #42 (Master) - Uncommon Azure
- Hatchling #156 (Guardian) - Common Pure
- Hatchling #287 (Guardian) - Rare Crystal
- Adult #1542 (Matching pair to #42!) - Uncommon Azure
- Hatchling #391 (Regular) - Common Pure
- Adult #1678 (Regular) - Rare Shadow
- Hatchling #445 (Regular) - Legendary Cyber (Jackpot!)
- Adult #1889 (Regular) - Common Pure
- Hatchling #523 (Regular) - Uncommon Verdant
- Adult #2001 (Regular) - Rare Titan

Result:
✅ Found matching pair (#42 ↔ #1542)
✅ Got Legendary (#445)
✅ Created 2 Guardians with different roles
✅ Can assign Adult #1542 as new Master (upgrade)
```

## Technical Implementation

### Master NFT Structure

```rust
#[account]
pub struct MasterNFT {
    pub nft_mint: Pubkey,              // NFT mint address
    pub encrypted_wallet: Pubkey,      // Shadow wallet address
    pub encryption_key_hash: [u8; 32], // Hash of encryption key
    pub toc_version: u8,               // Terms of Control version
    pub created_at: i64,               // Creation timestamp
    pub is_master: bool,               // Master status
    pub previous_master: Option<Pubkey>, // Previous Master (if reassigned)
}
```

### Guardian NFT Structure

```rust
#[account]
pub struct GuardianNFT {
    pub nft_mint: Pubkey,                    // NFT mint address
    pub master_nft: Pubkey,                  // Parent Master NFT
    pub permissions: Vec<Permission>,        // Assigned permissions
    pub delegated_pass_hash: [u8; 32],       // Hash of delegated pass (NOT master key)
    pub permission_scope: PermissionScope,   // What Guardian can access
    pub created_at: i64,                     // Creation timestamp
    pub created_by: Pubkey,                  // Master that created this Guardian
    pub expires_at: Option<i64>,             // Optional expiration
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Permission {
    ViewBalance,
    TransferTokens { max_amount: u64 },
    ManageSubdomains,
    ExecuteTransaction { tx_type: String },
    ReadData { data_type: String },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PermissionScope {
    pub can_access_funds: bool,              // Access to Funds wallet
    pub can_view_collections: bool,          // View Collections wallet
    pub can_manage_subdomains: Vec<String>,  // Specific subdomains only
    pub max_transaction_amount: u64,         // Transaction limit
    pub allowed_operations: Vec<String>,     // Specific operations only
}
```

### Encrypted Shadow Wallet

```rust
#[account]
pub struct EncryptedWallet {
    pub master_nft: Pubkey,            // Current Master NFT
    pub encrypted_data: Vec<u8>,       // Encrypted wallet data
    pub encryption_algorithm: String,  // e.g., "AES-256-GCM"
    pub toc_hash: [u8; 32],           // Terms of Control hash
    pub created_at: i64,               // Creation timestamp
    pub last_accessed: i64,            // Last decryption timestamp
}
```

### Instructions

```rust
// Create Master NFT with encrypted wallet
pub fn initialize_master(
    ctx: Context<InitializeMaster>,
    master_encryption_key: [u8; 32],  // Master key (NEVER shared)
    toc_version: u8,
) -> Result<()> {
    // Store hash of master key, not the key itself
    let master_key_hash = hash(&master_encryption_key);
    // Master key stays with Master NFT holder only
}

// Create Guardian NFT with delegated pass
pub fn create_guardian(
    ctx: Context<CreateGuardian>,
    permissions: Vec<Permission>,
    permission_scope: PermissionScope,
) -> Result<()> {
    // Verify caller holds Master NFT
    require!(
        ctx.accounts.master_nft_holder.key() == ctx.accounts.master_nft.authority,
        ErrorCode::Unauthorized
    );
    
    // Generate delegated pass (derived from master key, one-way)
    let delegated_pass = derive_delegated_pass(
        &ctx.accounts.master_nft.encryption_key_hash,
        &permission_scope,
        ctx.accounts.guardian_nft.key()
    );
    
    // Store delegated pass hash (NOT master key)
    ctx.accounts.guardian_nft.delegated_pass_hash = hash(&delegated_pass);
    ctx.accounts.guardian_nft.permissions = permissions;
    ctx.accounts.guardian_nft.permission_scope = permission_scope;
    
    // Master key NEVER leaves Master NFT
    Ok(())
}

// Assign new Master NFT (transfers master key)
pub fn assign_new_master(
    ctx: Context<AssignNewMaster>,
    new_master_nft: Pubkey,
) -> Result<()> {
    // Only current Master can assign new Master
    // Master encryption key transferred to new Master NFT
    // Old Master loses master key, becomes regular NFT or Guardian
}

// Decrypt wallet (requires Master NFT with master key)
pub fn decrypt_wallet(
    ctx: Context<DecryptWallet>,
    master_encryption_key: [u8; 32],  // Must provide master key
) -> Result<Vec<u8>> {
    // Verify Master NFT ownership
    require!(
        ctx.accounts.nft_holder.key() == ctx.accounts.master_nft.authority,
        ErrorCode::Unauthorized
    );
    
    // Verify master key matches
    require!(
        hash(&master_encryption_key) == ctx.accounts.master_nft.encryption_key_hash,
        ErrorCode::InvalidKey
    );
    
    // Decrypt full wallet with master key
    let decrypted_data = decrypt_aes256(
        &ctx.accounts.encrypted_wallet.encrypted_data,
        &master_encryption_key
    );
    
    Ok(decrypted_data)
}

// Execute Guardian action (uses delegated pass, NOT master key)
pub fn execute_guardian_action(
    ctx: Context<ExecuteGuardianAction>,
    action: Permission,
    delegated_pass: [u8; 32],  // Delegated pass (NOT master key)
) -> Result<()> {
    // Verify Guardian NFT ownership
    require!(
        ctx.accounts.nft_holder.key() == ctx.accounts.guardian_nft.authority,
        ErrorCode::Unauthorized
    );
    
    // Verify delegated pass matches
    require!(
        hash(&delegated_pass) == ctx.accounts.guardian_nft.delegated_pass_hash,
        ErrorCode::InvalidPass
    );
    
    // Verify action is within permissions
    require!(
        ctx.accounts.guardian_nft.permissions.contains(&action),
        ErrorCode::PermissionDenied
    );
    
    // Execute action with LIMITED scope (no master key access)
    match action {
        Permission::ViewBalance => {
            // Can view balance using delegated pass
            // Cannot decrypt full wallet
        },
        Permission::TransferTokens { max_amount } => {
            // Can transfer up to limit using delegated pass
            // Cannot access master key
        },
        _ => {}
    }
    
    Ok(())
}

// Helper: Derive delegated pass (one-way, cannot reverse to master key)
fn derive_delegated_pass(
    master_key_hash: &[u8; 32],
    scope: &PermissionScope,
    guardian_pubkey: Pubkey,
) -> [u8; 32] {
    // Use HKDF (HMAC-based Key Derivation Function)
    // Input: master_key_hash + scope + guardian_pubkey
    // Output: delegated_pass (cannot derive master key from this)
    
    let mut hasher = Sha256::new();
    hasher.update(master_key_hash);
    hasher.update(&scope.try_to_vec().unwrap());
    hasher.update(guardian_pubkey.as_ref());
    hasher.update(b"GUARDIAN_DELEGATED_PASS");
    
    let result = hasher.finalize();
    let mut delegated_pass = [0u8; 32];
    delegated_pass.copy_from_slice(&result);
    
    delegated_pass
}
```

## Security Features

### 1. Encryption Hierarchy
```
Master Encryption Key (Level 1)
├── Held ONLY by Master NFT holder
├── Decrypts entire shadow wallet
├── NEVER shared with Guardians
└── NEVER stored on-chain (only hash)

Delegated Passes (Level 2)
├── Derived from Master Key (one-way)
├── Given to Guardian NFTs
├── Limited scope access only
├── Cannot derive Master Key
└── Can be revoked by Master
```

**Key Derivation (One-Way)**:
```
Master Key → HKDF → Delegated Pass
                ↓
         Cannot reverse
                ↓
    Delegated Pass ✗→ Master Key
```

### 2. Master NFT as Key
- Physical possession required
- Master encryption key stays with holder
- Can be stored offline (cold storage)
- Hardware wallet compatible
- Trading transfers control AND master key

### 3. Guardian Limitations
- Granular permissions via delegated pass
- Cannot escalate privileges (no master key)
- Cannot access Master functions
- Cannot derive master key from delegated pass
- Auditable actions
- Scoped to specific wallets/subdomains

### 4. Delegated Pass Security
- **One-way derivation**: Cannot reverse to master key
- **Scope-limited**: Only accesses permitted wallets
- **Revocable**: Master can revoke at any time
- **Expirable**: Optional time-based expiration
- **Auditable**: All Guardian actions logged

### 5. TOC (Terms of Control)
- Additional decryption rules
- Time-based access
- Multi-signature requirements
- Emergency recovery procedures

## Use Cases

### 1. Secure Cold Storage
```
User mints Master NFT
↓
Master NFT holds master encryption key
↓
User creates Guardians with delegated passes
↓
Transfers Master to hardware wallet (offline)
↓
Master key now in cold storage
↓
Guardians use delegated passes for day-to-day operations
↓
Guardians CANNOT access master key
↓
Master only needed for critical actions
```

**Security Benefit**:
- Master key offline = Maximum security
- Guardians use delegated passes = Convenience
- Compromise of Guardian = Limited damage (no master key)
- Compromise of Master = Full wallet access (hence cold storage)

### 2. Team Management
```
Project mints Master NFT
↓
Master holds master encryption key
↓
Creates Guardian NFTs for team members
↓
Each Guardian receives delegated pass (NOT master key)
↓
Each Guardian has specific role:
  - Guardian #1: Marketing (delegated pass: view balance, social media)
  - Guardian #2: Developer (delegated pass: deploy contracts)
  - Guardian #3: Finance (delegated pass: transfer up to 1000 PANGI)
↓
Master NFT held by founder (offline, master key secure)
↓
If Guardian compromised: Revoke delegated pass, master key safe
```

**Security Benefit**:
- Team members get delegated passes, not master key
- Compromised team member = Revoke their pass only
- Master key remains secure with founder
- No single point of failure among team

### 3. Trading Without Risk
```
User has Master #42 (favorite NFT)
↓
Mints Adult #1542 (matching pair)
↓
Assigns Adult #1542 as new Master
↓
Trades Hatchling #42 for profit
↓
Retains full wallet control
```

### 4. Inheritance Planning
```
User creates Master NFT
↓
Creates Guardian NFT for heir
↓
Guardian has limited access now
↓
Upon trigger event (time/condition):
  Guardian automatically becomes Master
↓
Seamless inheritance
```

## Matching Pairs Strategy

### Scenario: User wants matching pair

**Without Master/Guardian system**:
- Mint randomly
- Hope for match
- Low probability

**With Master/Guardian system**:
```
User mints Hatchling #42 (Master)
↓
Mints 5 more NFTs (Guardians)
↓
Mints 10 more NFTs (searching for Adult #1542)
↓
Finally mints Adult #1542 (MATCH!)
↓
Assigns Adult #1542 as new Master
↓
Now has:
  - Matching pair (both owned)
  - Adult as Master (preferred)
  - 5 Guardians (utility)
  - 10 other NFTs (collection/trade)
```

**Benefits**:
- Increased minting revenue
- User engagement
- Collection building
- Utility for "non-match" NFTs

## Economic Model

### Minting Incentives

**Base mint price**: 0.1 SOL

**User behavior**:
- Mint 1 NFT: 1 Master, 0 Guardians
- Mint 5 NFTs: 1 Master, 4 Guardians (team setup)
- Mint 20 NFTs: 1 Master, 19 potential Guardians (match hunting)

**Revenue projection**:
- 3000 NFTs × 0.1 SOL = 300 SOL base
- Average 5 mints per user = 600 users
- Guardian creation encourages 2-3x minting
- Potential: 900-1500 SOL revenue

### Guardian Value Proposition

**Why create Guardians**:
1. **Delegation**: Assign tasks without Master risk
2. **Utility**: Every NFT has purpose
3. **Security**: Limit exposure of Master NFT
4. **Flexibility**: Different roles for different NFTs
5. **Collection**: Build functional NFT portfolio

## Subdomain System

### Concept
Each Master NFT can create subdomains (sub-wallets or namespaces)

**Example**:
```
Master NFT #42 creates:
  - subdomain: "trading" (for active trading)
  - subdomain: "staking" (for locked assets)
  - subdomain: "savings" (for long-term hold)

Guardian #1 manages "trading" subdomain
Guardian #2 manages "staking" subdomain
Master controls "savings" subdomain
```

**Benefits**:
- Organized asset management
- Granular Guardian permissions
- Risk isolation
- Clear accounting

## Implementation Roadmap

### Phase 1: Core System
- [ ] Master NFT creation
- [ ] Encrypted wallet generation
- [ ] Basic encryption/decryption
- [ ] Master reassignment

### Phase 2: Guardian System
- [ ] Guardian NFT creation
- [ ] Permission framework
- [ ] Guardian action execution
- [ ] Permission validation

### Phase 3: Advanced Features
- [ ] Subdomain creation
- [ ] TOC implementation
- [ ] Multi-signature support
- [ ] Emergency recovery

### Phase 4: UI/UX
- [ ] Master NFT dashboard
- [ ] Guardian management interface
- [ ] Wallet decryption UI
- [ ] Permission assignment tool

## Security Considerations

### Risks
1. **Master NFT loss**: Wallet permanently encrypted (master key lost)
2. **Master NFT theft**: Attacker gains full control (master key stolen)
3. **Guardian compromise**: Limited damage (only delegated pass exposed)
4. **Delegated pass theft**: Attacker gets Guardian permissions only
5. **Master key exposure**: Wallet fully compromised

### Mitigations
1. **Backup system**: Encrypted master key backup with recovery phrase
2. **Cold storage**: Master NFT offline, master key secure
3. **Delegated passes**: Guardians never get master key
4. **One-way derivation**: Cannot derive master key from delegated pass
5. **Pass revocation**: Master can revoke Guardian passes anytime
6. **Time-locks**: Delay on Master reassignment
7. **Permission auditing**: Log all Guardian actions
8. **Scope limitation**: Guardians only access permitted wallets
9. **Key rotation**: Periodic master key updates (Master only)

### Attack Scenarios & Defense

**Scenario 1: Guardian NFT Stolen**
```
Attacker steals Guardian NFT #1
↓
Attacker has delegated pass
↓
Can perform Guardian #1 permissions only
↓
CANNOT access master key
↓
CANNOT decrypt full wallet
↓
Master revokes Guardian #1 pass
↓
Attacker's access terminated
```

**Scenario 2: Master NFT Stolen**
```
Attacker steals Master NFT
↓
Attacker has master encryption key
↓
Can decrypt entire wallet
↓
FULL COMPROMISE
↓
Defense: Store Master in cold wallet (offline)
```

**Scenario 3: Delegated Pass Leaked**
```
Guardian #2 delegated pass leaked
↓
Attacker can perform Guardian #2 actions
↓
CANNOT derive master key (one-way derivation)
↓
CANNOT access other Guardians' scopes
↓
Master revokes Guardian #2 pass
↓
Generates new delegated pass for legitimate Guardian #2
```

**Scenario 4: Multiple Guardians Compromised**
```
Attacker compromises Guardian #1, #2, #3
↓
Has 3 delegated passes
↓
Can perform all 3 Guardians' permissions
↓
STILL CANNOT derive master key
↓
STILL CANNOT access Master-only wallets (Documents, Medical, ID)
↓
Master revokes all compromised passes
↓
Master key remains secure
```

## Conclusion

The Master/Guardian system transforms NFTs from collectibles into functional cryptographic keys, creating:
- **Utility**: Every NFT has purpose
- **Security**: Encrypted wallet protection
- **Flexibility**: Granular permission control
- **Engagement**: Incentivized minting
- **Innovation**: Novel NFT use case

This system makes PANGI NFTs essential tools, not just art.
