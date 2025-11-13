# PANGI NFT Collection Structure

## Series 1: Main Collection (3000 NFTs)

### Part 1: Hatchlings/Babies (1500 NFTs)
- **Supply**: 1500
- **Visual**: Baby pangolins with trait hints in artwork
- **Metadata**: Full trait data written (hidden reveal)
- **Purpose**: Corresponds to matching adult versions
- **Trait System**: Traits predetermined but visually subtle in baby form

### Part 2: Adults (1500 NFTs)
- **Supply**: 1500
- **Visual**: Full adult pangolins with complete trait reveal
- **Metadata**: Full trait data visible
- **Purpose**: Matching pairs with Part 1 hatchlings
- **Trait System**: Full visual representation of all traits

**Total Series 1**: 3000 NFTs (1500 pairs)

---

## Special Editions: Promotional Collection (Separate)

### Purpose
- Marketing and promotion
- Community engagement
- Showcase evolution stages
- Unique 1-of-1 pieces

### Types

#### 1. Full Evolution Sets
- Show all 5 stages: Egg → Hatchling → Juvenile → Adult → Legendary
- Complete visual progression
- Limited quantity

#### 2. Orphan Hatchlings
- Hatchlings without matching adults
- Unique designs not in main collection
- Promotional giveaways

#### 3. Orphan Adults
- Adults without matching hatchlings
- Unique designs not in main collection
- Special rewards

#### 4. Middle Stage Exclusives
- Juvenile stage only
- Not part of main collection pairs
- Special event NFTs

#### 5. 1-of-1 Legendaries
- Unique legendary tier
- No matching pair
- Ultra-rare promotional pieces

### Characteristics
- **Not counted** in the 3000 main collection
- **Separate mint** authority/collection
- **Flexible supply** based on marketing needs
- **No matching requirement** - standalone pieces

---

## Technical Implementation

### Series 1 (Main Collection)
```
Collection: PANGI Main
Max Supply: 3000
- Hatchlings: 1500 (IDs: 1-1500)
- Adults: 1500 (IDs: 1501-3000)
Matching: Hatchling #1 ↔ Adult #1501
```

### Special Editions
```
Collection: PANGI Special
Max Supply: Flexible (TBD)
- Full Evolution Sets: ~50-100
- Orphans: ~100-200
- Middle Stages: ~50-100
- 1-of-1s: ~10-20
No matching pairs required
```

---

## Metadata Structure

### Hatchling Metadata
```json
{
  "name": "PANGI Hatchling #1",
  "symbol": "PANGI",
  "description": "Baby pangolin with hidden traits",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Stage", "value": "Hatchling"},
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
  "description": "Adult pangolin with full trait reveal",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Stage", "value": "Adult"},
    {"trait_type": "Series", "value": "1"},
    {"trait_type": "Matching Hatchling", "value": "1"},
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

### Phase 1: Hatchlings (Series 1 Part 1)
1. Mint 1500 hatchlings
2. Traits generated and stored
3. Visual hints in artwork
4. Metadata includes matching adult ID

### Phase 2: Adults (Series 1 Part 2)
1. Mint 1500 adults
2. Traits match corresponding hatchlings
3. Full visual reveal
4. Metadata includes matching hatchling ID

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

Each hatchling and its matching adult share the same rarity tier.

---

## Smart Contract Considerations

### Two Collection Approach
```rust
// Collection 1: Main Series (3000)
pub struct MainCollection {
    max_supply: 3000,
    hatchling_range: (1, 1500),
    adult_range: (1501, 3000),
}

// Collection 2: Special Editions (Flexible)
pub struct SpecialEdition {
    max_supply: None, // Flexible
    edition_type: EditionType,
}

enum EditionType {
    FullEvolution,
    OrphanHatchling,
    OrphanAdult,
    MiddleStage,
    OneOfOne,
}
```
