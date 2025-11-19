# Obsidian Claw Clan - NFT Collection

## Overview

**Collection Name**: Obsidian Claw Clan  
**Total Supply**: 3000 NFTs  
**Structure**: 1500 Pangopups + 1500 Adults (matching pairs)

## Tribe System

### Main Tribe
- **Obsidian Claw (Pure)** - Base lineage, no hybridization

### Hybrid Lineages
1. **Azure Hybrid** - Water/Ocean themed
2. **Crystal Hybrid** - Crystalline/Gem themed
3. **Cyber Hybrid** - Tech/Digital themed
4. **Shadow Hybrid** - Dark/Stealth themed
5. **Sunscale Hybrid** - Solar/Fire themed
6. **Titan Hybrid** - Strength/Power themed
7. **Verdant Hybrid** - Nature/Forest themed

## Age Groups

- **Pangopup** (IDs 1-1500) - Baby pangolins with trait hints
- **Adult** (IDs 1501-3000) - Fully grown with complete trait reveal

## Trait Categories

### 1. Scale Type
- Volcanic Black
- Titan Alloy
- Golden Ember
- Coral Gloss
- Crystal Embedded
- Neon Circuit
- Magma Veined

### 2. Eyes
- Runic Red
- Data Circuit
- Ember
- Pearlescent
- Bioluminescent
- Solar Amber
- Nocturne Blue

### 3. Tail Type
- Standard Coil
- Coral Fan
- Solar Plume
- Titan Crest
- Crystal Hook
- Neon Stream
- Forest Wrap

### 4. Body Markings
- Vine Spread
- Solar Engraving
- Lava Cracks
- Runic Lines
- Circuit Map
- Coral Pattern
- Shadow Veins

### 5. Aura Effect
- Solar Flare
- Shadow Drift
- Neon Surge
- Heatwave
- Tidal Reflection
- Mist Cloak
- Crystal Bloom

### 6. Background
- Shadow Swamp
- Volcanic Plains
- Titan Ruins
- Ancient Jungle
- Sun Dunes
- Coral Reef
- Neon Abyss

## Rarity Distribution

### Total: 3000 NFTs (1500 pairs)

| Rarity | Pangopups | Adults | Total | Percentage |
|--------|-----------|--------|-------|------------|
| Common | 750 | 750 | 1500 | 50% |
| Uncommon | 525 | 525 | 1050 | 35% |
| Rare | 150 | 150 | 300 | 10% |
| Legendary | 75 | 75 | 150 | 5% |

### Rarity by Lineage

#### Pure Obsidian Claw
- Common: ~600 pairs
- Uncommon: ~150 pairs
- Rare: ~50 pairs
- Legendary: ~25 pairs

#### Hybrid Lineages (Each)
- Azure: 240 total (120 pairs)
- Crystal: 240 total (120 pairs)
- Cyber: 210 total (105 pairs)
- Shadow: 220 total (110 pairs)
- Sunscale: 220 total (110 pairs)
- Titan: 210 total (105 pairs)
- Verdant: 210 total (105 pairs)

## Matching Pairs System

Each Pangopup has a corresponding Adult with:
- **Same lineage** (Pure or specific Hybrid)
- **Same rarity tier**
- **Matching base traits** (scale type, eyes, etc.)
- **Adult-specific additions** (enhanced markings, backgrounds)

### Example Pair
```
Pangopup #1:
- Tribe: Obsidian Claw (Verdant Hybrid)
- Age: Pangopup
- Scale: Neon Circuit
- Eyes: Runic Red
- Tail: Coral Fan
- Markings: Solar Engraving
- Aura: Solar Flare
- Background: Shadow Swamp
- Rarity: Uncommon

Adult #1501:
- Tribe: Obsidian Claw (Verdant Hybrid)
- Age: Adult
- Scale: Neon Circuit (same)
- Eyes: Runic Red (same)
- Tail: Coral Fan (same)
- Markings: Solar Engraving (enhanced)
- Aura: Solar Flare (enhanced)
- Background: Shadow Swamp (same)
- Rarity: Uncommon (same)
```

## Trait Combinations

### Unique Combinations
- **Scale Types**: 7 options
- **Eyes**: 7 options
- **Tail Types**: 7 options
- **Body Markings**: 7 options
- **Aura Effects**: 7 options
- **Backgrounds**: 7 options

**Theoretical Combinations**: 7^6 = 117,649 possible combinations  
**Actual Collection**: 3000 NFTs (carefully curated subset)

## Legendary Traits

### Legendary Indicators
Legendary NFTs typically feature:
- **Nocturne Blue eyes** (rare eye color)
- **Unique trait combinations**
- **Enhanced aura effects**
- **Premium backgrounds** (Neon Abyss, Titan Ruins)

### Legendary Count by Lineage
- Azure Hybrid: 16 Legendary (8 pairs)
- Crystal Hybrid: 21 Legendary (10-11 pairs)
- Cyber Hybrid: 20 Legendary (10 pairs)
- Shadow Hybrid: 21 Legendary (10-11 pairs)
- Sunscale Hybrid: 20 Legendary (10 pairs)
- Titan Hybrid: 20 Legendary (10 pairs)
- Verdant Hybrid: 16 Legendary (8 pairs)
- Pure Obsidian: ~16 Legendary (8 pairs)

**Total Legendary**: 150 NFTs (75 pairs) = 5% of collection

## Collection Strategy

### Phase 1: Pangopup Mint (1500 NFTs)
- Mint IDs 1-1500
- Trait hints in artwork
- Full metadata stored
- Matching adult ID referenced

### Phase 2: Adult Mint (1500 NFTs)
- Mint IDs 1501-3000
- Full trait reveal in artwork
- Enhanced visual details
- Matching pangopup ID referenced

### Pairing System
```
Pangopup #1 ↔ Adult #1501
Pangopup #2 ↔ Adult #1502
...
Pangopup #1500 ↔ Adult #3000
```

## Lore: The Obsidian Claw Clan

The Obsidian Claw Clan represents the ancient pangolin warriors who protected the mystical forests. Through generations, some clan members formed bonds with elemental forces, creating the hybrid lineages:

- **Azure**: Bonded with ocean depths
- **Crystal**: Merged with ancient gems
- **Cyber**: Evolved with technology
- **Shadow**: Mastered stealth arts
- **Sunscale**: Harnessed solar power
- **Titan**: Gained immense strength
- **Verdant**: United with nature

Each pangopup carries the potential of their lineage, growing into powerful adults who continue the clan's legacy.

## Technical Implementation

### Metadata Structure
```json
{
  "name": "Obsidian Claw #1",
  "collection": "Obsidian Claw Clan",
  "attributes": [
    {"trait_type": "Tribe", "value": "Obsidian Claw (Verdant Hybrid)"},
    {"trait_type": "Age Group", "value": "Pangopup"},
    {"trait_type": "Scale Type", "value": "Neon Circuit"},
    {"trait_type": "Eyes", "value": "Runic Red"},
    {"trait_type": "Tail Type", "value": "Coral Fan"},
    {"trait_type": "Body Markings", "value": "Solar Engraving"},
    {"trait_type": "Aura Effect", "value": "Solar Flare"},
    {"trait_type": "Background", "value": "Shadow Swamp"},
    {"trait_type": "Rarity", "value": "Uncommon"},
    {"trait_type": "Lineage", "value": "Verdant"},
    {"trait_type": "Matching NFT", "value": "1501"}
  ]
}
```

### Smart Contract Integration
- Use existing `pangi-nft` program
- Set `series = 1` (Main Collection)
- Set `matching_nft_id` for pairs
- Set `is_special_edition = false`

## Marketing Angles

1. **Collect the Pair** - Own both pangopup and adult
2. **Lineage Pride** - Collect all from one hybrid line
3. **Rarity Hunt** - Chase legendary combinations
4. **Lore Building** - Each lineage has unique story
5. **Visual Evolution** - See your pangopup's adult form

## File Location

**CSV File**: `Obsidian_Claw_Traits.csv`  
**Total Rows**: 3001 (including header)  
**Format**: CSV with 11 columns

## Next Steps

1. ✅ Restore CSV file from git history
2. ⬜ Commission artwork for 3000 NFTs
3. ⬜ Generate metadata JSON files
4. ⬜ Upload to IPFS
5. ⬜ Update smart contract for Obsidian Claw collection
6. ⬜ Create minting interface
7. ⬜ Launch marketing campaign
