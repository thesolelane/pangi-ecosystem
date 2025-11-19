# PANGI NFT Implementation Guide

## Overview

The PANGI NFT collection consists of two distinct series with different mechanics:

### Series 1: Main Collection (3000 NFTs)
- **1500 Pangopups** (Part 1) - Baby pangolins with trait hints
- **1500 Adults** (Part 2) - Matching adults with full trait reveal
- **No evolution** - Pangopups and Adults are separate mints
- **Matching pairs** - Each pangopup has a corresponding adult

### Series 2: Special Editions (Flexible Supply)
- Promotional and marketing NFTs
- Can include all 5 stages (Egg, Pangopup, Juvenile, Adult, Legendary)
- **Evolution enabled** for special editions
- No matching requirements
- Includes 1-of-1s and orphan NFTs

## Smart Contract Changes

### New Fields in `Pangopup` Account
```rust
pub series: u8,              // 1 = Main, 2 = Special
pub matching_nft_id: u16,    // Matching pair ID
pub is_special_edition: bool, // Evolution enabled if true
```

### Initialization Parameters
```rust
initialize_pangopup(
    evolution_cooldown: i64,
    series: u8,              // NEW: 1 or 2
    matching_nft_id: u16,    // NEW: Pair ID
    is_special_edition: bool // NEW: Enable evolution
)
```

### Evolution Rules
- **Series 1 (Main)**: Evolution disabled, returns `MainCollectionNoEvolution` error
- **Series 2 (Special)**: Evolution enabled through all 5 stages

## Minting Strategy

### Phase 1: Pangopups (IDs 1-1500)
```typescript
// Mint Pangopup #1
await program.methods
  .initializePangopup(
    new BN(86400), // 24h cooldown (not used for main collection)
    1,             // series = 1 (Main Collection)
    1501,          // matching_nft_id = Adult #1501
    false          // is_special_edition = false
  )
  .accounts({...})
  .rpc();
```

### Phase 2: Adults (IDs 1501-3000)
```typescript
// Mint Adult #1501 (matches Pangopup #1)
await program.methods
  .initializePangopup(
    new BN(86400),
    1,             // series = 1 (Main Collection)
    1,             // matching_nft_id = Pangopup #1
    false          // is_special_edition = false
  )
  .accounts({...})
  .rpc();
```

### Phase 3: Special Editions
```typescript
// Mint Special Edition with evolution enabled
await program.methods
  .initializePangopup(
    new BN(3600),  // 1h cooldown for evolution
    2,             // series = 2 (Special Edition)
    0,             // matching_nft_id = 0 (no match)
    true           // is_special_edition = true (evolution enabled)
  )
  .accounts({...})
  .rpc();
```

## Metadata Structure

### Pangopup Metadata (Series 1)
```json
{
  "name": "PANGI Pangopup #1",
  "description": "Baby pangolin with hidden traits that hint at its adult form",
  "image": "ipfs://QmPangopup1",
  "attributes": [
    {"trait_type": "Stage", "value": "Pangopup"},
    {"trait_type": "Series", "value": "Main Collection"},
    {"trait_type": "ID", "value": "1"},
    {"trait_type": "Matching Adult", "value": "1501"},
    {"trait_type": "Rarity", "value": "Rare"},
    {"trait_type": "Strength", "value": "20"},
    {"trait_type": "Agility", "value": "18"},
    {"trait_type": "Intelligence", "value": "22"},
    {"trait_type": "Scale Pattern Hint", "value": "Diamond"},
    {"trait_type": "Eye Color", "value": "Amber"}
  ]
}
```

### Adult Metadata (Series 1)
```json
{
  "name": "PANGI Adult #1501",
  "description": "Adult pangolin with fully revealed traits",
  "image": "ipfs://QmAdult1501",
  "attributes": [
    {"trait_type": "Stage", "value": "Adult"},
    {"trait_type": "Series", "value": "Main Collection"},
    {"trait_type": "ID", "value": "1501"},
    {"trait_type": "Matching Pangopup", "value": "1"},
    {"trait_type": "Rarity", "value": "Rare"},
    {"trait_type": "Strength", "value": "20"},
    {"trait_type": "Agility", "value": "18"},
    {"trait_type": "Intelligence", "value": "22"},
    {"trait_type": "Scale Pattern", "value": "Diamond"},
    {"trait_type": "Eye Color", "value": "Amber"},
    {"trait_type": "Armor", "value": "Reinforced Scales"},
    {"trait_type": "Accessory", "value": "Ranger Badge"},
    {"trait_type": "Background", "value": "Jungle Canopy"}
  ]
}
```

### Special Edition Metadata
```json
{
  "name": "PANGI Legendary Guardian",
  "description": "1-of-1 Legendary Pangolin - Promotional Edition",
  "image": "ipfs://QmLegendary1",
  "attributes": [
    {"trait_type": "Stage", "value": "Legendary"},
    {"trait_type": "Series", "value": "Special Edition"},
    {"trait_type": "Edition", "value": "1 of 1"},
    {"trait_type": "Type", "value": "Promotional"},
    {"trait_type": "Can Evolve", "value": "Yes"},
    {"trait_type": "Rarity", "value": "Legendary"},
    ...
  ]
}
```

## Trait Matching System

### Pangopup Traits (Hints)
- **Visual**: Subtle hints in artwork (color palette, scale pattern outline)
- **Metadata**: Full trait data stored but described as "hints"
- **Purpose**: Create anticipation for adult reveal

### Adult Traits (Full Reveal)
- **Visual**: Complete trait expression in artwork
- **Metadata**: Same trait values as matching pangopup
- **Additional**: Adult-specific traits (armor, accessories, background)

### Trait Categories

#### Shared Traits (Pangopup + Adult)
- Rarity tier
- Base stats (Strength, Agility, Intelligence)
- Scale pattern
- Eye color
- Special ability

#### Adult-Only Traits
- Armor type
- Accessories
- Background/environment
- Pose/stance
- Detailed scale texture

## Rarity Distribution

### Series 1 Main Collection (3000 total)
| Rarity | Count | Percentage | Pairs |
|--------|-------|------------|-------|
| Common | 1500 | 50% | 750 |
| Uncommon | 750 | 25% | 375 |
| Rare | 450 | 15% | 225 |
| Epic | 240 | 8% | 120 |
| Legendary | 60 | 2% | 30 |

### Series 2 Special Editions
- Flexible rarity distribution
- Can include ultra-rare 1-of-1s
- Not bound by main collection percentages

## Frontend Integration

### Display Matching Pairs
```typescript
// Fetch pangopup
const pangopup = await program.account.pangopup.fetch(pangopupPDA);

// Find matching adult
const matchingAdultId = pangopup.matchingNftId;
const adultPDA = findAdultPDA(matchingAdultId);
const adult = await program.account.pangopup.fetch(adultPDA);

// Display pair
console.log(`Pangopup #${pangopup.id} ↔ Adult #${adult.id}`);
```

### Check Evolution Capability
```typescript
const nft = await program.account.pangopup.fetch(nftPDA);

if (nft.isSpecialEdition) {
  // Show evolution button
  console.log("This NFT can evolve!");
} else {
  // Show matching pair info
  console.log(`Matching NFT: #${nft.matchingNftId}`);
}
```

## Marketing Use Cases

### Special Editions

#### 1. Full Evolution Showcase
- Mint 5 NFTs showing Egg → Legendary progression
- Use for promotional videos/content
- Demonstrate evolution mechanics

#### 2. Community Giveaways
- Orphan pangopups (no matching adult)
- Unique designs not in main collection
- Twitter/Discord contests

#### 3. Partnership Rewards
- Custom 1-of-1 legendaries
- Collaboration-themed NFTs
- Influencer editions

#### 4. Event Exclusives
- Middle-stage NFTs (Juvenile only)
- Limited-time promotional drops
- Conference/meetup commemoratives

## Technical Validation

### Series 1 Validation
```rust
// Pangopup mint (ID 1-1500)
require!(series == 1, "Must be Series 1");
require!(!is_special_edition, "Main collection not special");
require!(matching_nft_id > 1500 && matching_nft_id <= 3000, "Adult ID must be 1501-3000");

// Adult mint (ID 1501-3000)
require!(series == 1, "Must be Series 1");
require!(!is_special_edition, "Main collection not special");
require!(matching_nft_id >= 1 && matching_nft_id <= 1500, "Pangopup ID must be 1-1500");
```

### Series 2 Validation
```rust
require!(series == 2, "Must be Series 2");
require!(is_special_edition, "Special editions must have evolution enabled");
// No matching_nft_id validation (can be 0 or any value)
```

## Next Steps

1. **Generate Trait Matrix**: Create CSV with 1500 trait combinations
2. **Commission Artwork**: 
   - 1500 pangopup images (with hints)
   - 1500 adult images (full reveal)
   - Special edition artwork as needed
3. **Metadata Generation**: Script to create JSON metadata for all NFTs
4. **IPFS Upload**: Upload images and metadata
5. **Minting Script**: Automated minting with proper parameters
6. **Frontend**: Display matching pairs and special editions

## Questions?

- How to handle trait generation for 1500 pairs?
- Art style preferences for pangopup "hints"?
- Special edition quantities and types?
- Minting schedule and phases?
