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
User assigns limited permissions
↓
Hatchling #156 = Guardian NFT
↓
Guardian can perform assigned tasks only
```

**Guardian Permissions** (examples):
- View wallet balance (read-only)
- Transfer tokens (up to limit)
- Manage subdomains
- Execute specific transactions
- Access certain data

**Guardian Limitations**:
- ❌ Cannot decrypt full wallet
- ❌ Cannot create other Guardians
- ❌ Cannot change Master
- ❌ Cannot access Master-level functions
- ✅ Only performs assigned tasks

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
    pub nft_mint: Pubkey,              // NFT mint address
    pub master_nft: Pubkey,            // Parent Master NFT
    pub permissions: Vec<Permission>,  // Assigned permissions
    pub created_at: i64,               // Creation timestamp
    pub created_by: Pubkey,            // Master that created this Guardian
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Permission {
    ViewBalance,
    TransferTokens { max_amount: u64 },
    ManageSubdomains,
    ExecuteTransaction { tx_type: String },
    ReadData { data_type: String },
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
    encryption_key: [u8; 32],
    toc_version: u8,
) -> Result<()>

// Create Guardian NFT with permissions
pub fn create_guardian(
    ctx: Context<CreateGuardian>,
    permissions: Vec<Permission>,
) -> Result<()>

// Assign new Master NFT
pub fn assign_new_master(
    ctx: Context<AssignNewMaster>,
    new_master_nft: Pubkey,
) -> Result<()>

// Decrypt wallet (requires Master NFT)
pub fn decrypt_wallet(
    ctx: Context<DecryptWallet>,
    encryption_key: [u8; 32],
) -> Result<Vec<u8>>

// Execute Guardian action
pub fn execute_guardian_action(
    ctx: Context<ExecuteGuardianAction>,
    action: Permission,
) -> Result<()>
```

## Security Features

### 1. Encryption
- All wallet data encrypted at rest
- AES-256-GCM or similar
- Key derived from Master NFT
- TOC adds additional security layer

### 2. Master NFT as Key
- Physical possession required
- Can be stored offline (cold storage)
- Hardware wallet compatible
- Trading transfers control

### 3. Guardian Limitations
- Granular permissions
- Cannot escalate privileges
- Cannot access Master functions
- Auditable actions

### 4. TOC (Terms of Control)
- Additional decryption rules
- Time-based access
- Multi-signature requirements
- Emergency recovery procedures

## Use Cases

### 1. Secure Cold Storage
```
User mints Master NFT
↓
Transfers Master to hardware wallet
↓
Wallet data encrypted and secure
↓
Guardians handle day-to-day operations
↓
Master only needed for critical actions
```

### 2. Team Management
```
Project mints Master NFT
↓
Creates Guardian NFTs for team members
↓
Each Guardian has specific role:
  - Guardian #1: Marketing (view balance, social media)
  - Guardian #2: Developer (deploy contracts)
  - Guardian #3: Finance (transfer up to 1000 PANGI)
↓
Master NFT held by founder (offline)
```

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
1. **Master NFT loss**: Wallet permanently encrypted
2. **Master NFT theft**: Attacker gains full control
3. **Guardian privilege escalation**: Security vulnerability
4. **Encryption key exposure**: Wallet compromised

### Mitigations
1. **Backup system**: Encrypted key backup with recovery phrase
2. **Time-locks**: Delay on Master reassignment
3. **Permission auditing**: Log all Guardian actions
4. **Key rotation**: Periodic encryption key updates

## Conclusion

The Master/Guardian system transforms NFTs from collectibles into functional cryptographic keys, creating:
- **Utility**: Every NFT has purpose
- **Security**: Encrypted wallet protection
- **Flexibility**: Granular permission control
- **Engagement**: Incentivized minting
- **Innovation**: Novel NFT use case

This system makes PANGI NFTs essential tools, not just art.
