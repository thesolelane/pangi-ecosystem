# PANGI NFT Collection Structure

## Series 1: Main Collection (3000 NFTs)

### Part 1: Pangopups (1500 NFTs) - AVAILABLE NOW
- **Supply**: 1500
- **Availability**: Mint immediately
- **Visual**: Baby pangolins (pangopups) with soft, pale scales and trait hints
- **Metadata**: Full trait data written (hidden reveal)
- **Purpose**: Corresponds to matching adult versions
- **Trait System**: Traits predetermined but visually subtle in pup form
- **Biological Accuracy**: 
  - Pangolins give **live birth** (not eggs)
  - Babies called "pangopups"
  - Born with soft, pale/pink scales that harden within days
  - Artwork shows pups clinging to mother's tail/back
  - Typically single offspring (some Asiatic species have up to 3)

### Part 2: Adults (1500 NFTs) - UNLOCK SYSTEM
- **Supply**: 1500
- **Availability**: LOCKED until unlock conditions met
- **Visual**: Full adult pangolins with complete trait reveal
- **Metadata**: Full trait data visible
- **Purpose**: Matching pairs with Part 1 pangopups
- **Trait System**: Full visual representation of all traits

**Unlock Conditions** (whichever comes first):
1. **50% Mint Threshold**: When 750 pangopups (50% of Part 1) are minted, Part 2 unlocks for everyone
2. **Staking Early Access**: Stake $100 USD worth of PANGI → Adult airdropped directly to wallet

**Total Series 1**: 3000 NFTs (1500 pairs)

**Growth System**: Pangopups "grow" into adults through unlock mechanism - not evolution, but availability unlock

---

## Pangolin Biology & Lore

### Real-World Biology
Pangolins are unique mammals with fascinating reproductive traits:

**Live Birth**:
- Female pangolins give birth to **live young** (not eggs)
- Gestation period: 3-5 months depending on species
- Typically give birth to a **single pangopup**
- Some Asiatic species can have up to 3 offspring

**Pangopup Development**:
- Born with **soft, pale scales** (pink or white)
- Scales **harden within 2-3 days**
- Scales **darken** as they mature
- Pangopups **cling to mother's scales**
- Often ride on **mother's back or tail base**
- Stay with mother for **first few months**
- Learn to forage and defend themselves

**Scale Transformation**:
- Birth: Soft, pale, flexible
- Days 1-3: Hardening begins
- Week 1: Scales firm up
- Months 1-3: Darkening and strengthening
- Adulthood: Fully hardened, dark, protective armor

### PANGI Collection Lore

**The Obsidian Claw Clan**:
Ancient pangolin warriors born in the volcanic regions of a mystical realm. Each pangopup is born with soft, pale scales that hint at their future power. As they mature, their scales harden and darken, revealing their true lineage and elemental affinity.

**Matching Pairs Represent**:
- **Pangopup**: The beginning - soft scales, learning, potential
- **Adult**: The realization - hardened scales, power, protection

**Why Matching Pairs?**:
The collection honors the pangolin's life journey from vulnerable pup to armored protector. Collectors who own both forms witness the complete transformation, though the NFTs themselves remain static representations of each life stage.

**Artwork Details**:
- **Pangopups**: Shown clinging to mother's tail, soft pale scales, curious eyes
- **Adults**: Standing proud, dark hardened scales, battle-ready stance
- **Trait Continuity**: Same traits in both forms, but visually subtle in pups, bold in adults

---

## Special Editions: 1-of-1 Titled NFTs

**Status**: ACTIVE - Limited promotional collection

### Characteristics
- **Supply**: Flexible (TBD based on titles)
- **Type**: 1-of-1 unique NFTs
- **Matching Pairs**: NONE - These are standalone
- **Stage**: Can be either Pangopup OR Adult (not both)
- **Rarity**: Ultra-rare, unique artwork

### Title System

**Royal Court**:
- King Pangolin
- Queen Pangolin
- Prince Pangolin
- Princess Pangolin
- Royal Guard Pangolin

**Government/Leadership**:
- Chancellor Pangolin
- Ambassador Pangolin
- General Pangolin
- Admiral Pangolin
- Chief Pangolin

**Legendary Titles**:
- Ancient Elder Pangolin
- Mystic Sage Pangolin
- Warlord Pangolin
- Archon Pangolin
- Sovereign Pangolin

### Distribution
- **Promotional**: Giveaways, contests, partnerships
- **Special Events**: Launch rewards, milestones
- **Community**: Top stakers, early supporters
- **Auctions**: Rare 1-of-1s for fundraising

### Unique Features
- Custom artwork (not from main collection traits)
- Special titles in metadata
- Enhanced utility (higher staking rewards, governance)
- No matching pair requirement
- Can be pangopup OR adult stage

---

## Technical Implementation

### Main Collection (ONLY Collection)
```
Collection: PANGI Obsidian Claw
Max Supply: 3000
- Pangopups: 1500 (IDs: 1-1500)
- Adults: 1500 (IDs: 1501-3000)
Matching: Pangopup #1 ↔ Adult #1501
Growth: Unlock mechanism (not evolution)

Part 1 Status: AVAILABLE NOW
Part 2 Status: LOCKED until 50% mint OR $100 staking
```

### Special Editions
```
Collection: PANGI Special Titles
Max Supply: ~20-50 (flexible)
Type: 1-of-1 unique NFTs
Titles: King, Queen, Chancellor, General, Elder, etc.
Stage: Either Pangopup OR Adult (no pairs)
Distribution: Promotional, events, top stakers
Rarity: Ultra-rare
```

---

## Metadata Structure

### Pangopup Metadata
```json
{
  "name": "PANGI Pangopup #1",
  "symbol": "PANGI",
  "description": "Baby pangolin born with soft, pale scales. Pangolins give live birth - these pangopups cling to their mother's tail as their scales harden.",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Stage", "value": "Pangopup"},
    {"trait_type": "Birth Type", "value": "Live Birth"},
    {"trait_type": "Scale Condition", "value": "Soft & Pale"},
    {"trait_type": "Series", "value": "1"},
    {"trait_type": "Matching Adult", "value": "1501"},
    {"trait_type": "Strength", "value": "15", "display_type": "number"},
    {"trait_type": "Agility", "value": "12", "display_type": "number"},
    {"trait_type": "Intelligence", "value": "18", "display_type": "number"},
    {"trait_type": "Scale Pattern", "value": "Diamond"},
    {"trait_type": "Eye Color", "value": "Amber"},
    {"trait_type": "Special Ability", "value": "Night Vision"}
  ]
}
```

### Adult Metadata
```json
{
  "name": "PANGI Adult #1501",
  "symbol": "PANGI",
  "description": "Mature pangolin with hardened, darkened scales. Fully grown and ready to protect the clan.",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Stage", "value": "Adult"},
    {"trait_type": "Scale Condition", "value": "Hardened & Dark"},
    {"trait_type": "Series", "value": "1"},
    {"trait_type": "Matching Pangopup", "value": "1"},
    {"trait_type": "Strength", "value": "15", "display_type": "number"},
    {"trait_type": "Agility", "value": "12", "display_type": "number"},
    {"trait_type": "Intelligence", "value": "18", "display_type": "number"},
    {"trait_type": "Scale Pattern", "value": "Diamond"},
    {"trait_type": "Eye Color", "value": "Amber"},
    {"trait_type": "Special Ability", "value": "Night Vision"},
    {"trait_type": "Armor Type", "value": "Reinforced Scales"},
    {"trait_type": "Accessory", "value": "Ranger Badge"}
  ]
}
```

### Special Edition Metadata
```json
{
  "name": "PANGI Legendary #1",
  "symbol": "PANGI-SE",
  "description": "1-of-1 Legendary Pangolin",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Stage", "value": "Legendary"},
    {"trait_type": "Series", "value": "Special Edition"},
    {"trait_type": "Edition", "value": "1 of 1"},
    {"trait_type": "Type", "value": "Promotional"},
    ...
  ]
}
```

---

## Minting Strategy

### Phase 1: Pangopups (Series 1 Part 1)
1. Mint 1500 pangopups
2. Traits generated and stored
3. Visual hints in artwork
4. Metadata includes matching adult ID

### Phase 2: Adults (Series 1 Part 2)
1. Mint 1500 adults
2. Traits match corresponding pangopups
3. Full visual reveal
4. Metadata includes matching pangopup ID

### Phase 3: Special Editions (Ongoing)
1. Mint as needed for marketing
2. No matching requirements
3. Flexible supply
4. Separate collection authority

---

## Rarity Distribution (Series 1 Main Collection)

Based on 3000 total (1500 pairs):

- **Common**: 1500 (50%) - 750 pairs
- **Uncommon**: 750 (25%) - 375 pairs
- **Rare**: 450 (15%) - 225 pairs
- **Epic**: 240 (8%) - 120 pairs
- **Legendary**: 60 (2%) - 30 pairs

Each pangopup and its matching adult share the same rarity tier.

---

## Smart Contract Considerations

### Two Collection Approach
```rust
// Collection 1: Main Series (3000)
pub struct MainCollection {
    max_supply: 3000,
    pangopup_range: (1, 1500),
    adult_range: (1501, 3000),
}

// Collection 2: Special Editions (Flexible)
pub struct SpecialEdition {
    max_supply: None, // Flexible
    edition_type: EditionType,
}

enum EditionType {
    FullEvolution,
    OrphanPangopup,
    OrphanAdult,
    MiddleStage,
    OneOfOne,
}
```
