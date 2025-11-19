# PANGI Token - Scales Terminology

## 🦎 What are Scales?

**Scales** are the smallest unit of PANGI tokens, representing the protective scales of a pangolin.

Just like:
- **Bitcoin** has **satoshis** (sats)
- **Ethereum** has **wei**
- **Solana** has **lamports**

**PANGI** has **scales** ⚖️

---

## 📊 Conversion

```
1 PANGI = 1,000,000,000 scales (1 billion scales)
1 scale = 0.000000001 PANGI
```

### Examples

| PANGI | Scales |
|-------|--------|
| 1 PANGI | 1,000,000,000 scales (1B) |
| 10 PANGI | 10,000,000,000 scales (10B) |
| 100 PANGI | 100,000,000,000 scales (100B) |
| 1,000 PANGI | 1,000,000,000,000 scales (1T) |
| 10,000 PANGI | 10,000,000,000,000 scales (10T) |

---

## 💡 Why Scales?

### 1. **Branding**
- Memorable and thematic
- Connects to pangolin conservation
- Unique identity in crypto space

### 2. **Precision**
- Allows micro-transactions
- Precise fee calculations
- Flexible pricing

### 3. **User Experience**
- Easy to understand
- Relatable concept
- Educational opportunity

---

## 🎨 Display Guidelines

### Large Amounts (≥ 1 PANGI)
```
Display: 10,000 PANGI
Tooltip: 10,000,000,000,000 scales (10T scales)
```

### Medium Amounts (0.001 - 1 PANGI)
```
Display: 0.5 PANGI
Tooltip: 500,000,000 scales (500M scales)
```

### Small Amounts (< 0.001 PANGI)
```
Display: 1,000 scales
Tooltip: 0.000001 PANGI
```

### Fees & Micro-transactions
```
Display: 5,000 scales
Tooltip: 0.000005 PANGI
```

---

## 🔧 Technical Implementation

### Constants

```typescript
export const PANGI_DECIMALS = 9;
export const SCALES_PER_PANGI = 1_000_000_000;
export const PANGI_SYMBOL = "PANGI";
export const PANGI_UNIT_NAME = "scales";
```

### Conversion Functions

```typescript
// Convert PANGI to scales
function pangiToScales(pangi: number): number {
  return Math.floor(pangi * 1_000_000_000);
}

// Convert scales to PANGI
function scalesToPangi(scales: number): number {
  return scales / 1_000_000_000;
}

// Format for display
function formatPangi(scales: number): string {
  const pangi = scalesToPangi(scales);
  
  if (pangi < 0.001 && pangi > 0) {
    return `${scales.toLocaleString()} scales`;
  }
  
  return `${pangi.toLocaleString()} PANGI`;
}
```

### Smart Contract

```rust
// In Rust smart contracts
pub const DECIMALS: u8 = 9;
pub const SCALES_PER_PANGI: u64 = 1_000_000_000;

/// Convert PANGI to scales
pub fn pangi_to_scales(pangi: u64) -> u64 {
    pangi.checked_mul(SCALES_PER_PANGI).unwrap()
}

/// Convert scales to PANGI
pub fn scales_to_pangi(scales: u64) -> u64 {
    scales / SCALES_PER_PANGI
}
```

---

## 📱 UI Examples

### Balance Display

```tsx
<div>
  <div className="text-3xl font-bold">
    10,000 PANGI
  </div>
  <div className="text-sm text-gray-500" title="10,000,000,000,000 scales">
    ⚖️ 10T scales
  </div>
</div>
```

### Transaction Preview

```tsx
<div>
  <p>Sending: 100 PANGI</p>
  <p className="text-sm text-gray-500">
    (100,000,000,000 scales)
  </p>
  <p className="text-xs text-gray-400">
    Fee: 5,000 scales
  </p>
</div>
```

### Staking Rewards

```tsx
<div>
  <p>Daily Rewards: 10 CATH</p>
  <p className="text-sm">
    Stake 10,000 PANGI (10T scales)
  </p>
</div>
```

---

## 🎓 Educational Content

### Tooltip Text

```
"Scales are the smallest unit of PANGI. 
1 PANGI = 1 billion scales.

Just like a pangolin's protective scales, 
each scale represents a tiny piece of 
conservation action."
```

### Help Section

```markdown
## What are scales?

Scales are the smallest unit of PANGI tokens, 
named after the protective scales of pangolins.

### Why scales?
- **Precision**: Allows micro-transactions
- **Branding**: Memorable and thematic
- **Conservation**: Each scale protects pangolins

### How many scales in 1 PANGI?
1 PANGI = 1,000,000,000 scales (1 billion)

### When are scales used?
- Transaction fees
- Micro-payments
- Precise calculations
- Small amounts (< 0.001 PANGI)
```

---

## 📊 Use Cases

### 1. Transaction Fees

```
Fee: 5,000 scales (0.000005 PANGI)
```

**Why scales?**
- More readable than 0.000005
- Easier to compare fees
- Feels more substantial

### 2. Staking Rewards

```
Daily Reward: 10 PANGI (10B scales)
```

**Why show both?**
- Educational
- Shows precision
- Builds understanding

### 3. Micro-transactions

```
Tip: 1,000 scales
```

**Why scales?**
- Small amounts look better
- Encourages micro-tipping
- More engaging

### 4. Price Display

```
Price: 0.5 PANGI (500M scales)
```

**Why show both?**
- Flexibility
- User preference
- Context-dependent

---

## 🌐 Marketing Copy

### Website

```markdown
# PANGI Token

Measured in **scales** ⚖️

Just like a pangolin's protective armor, 
each scale represents conservation action.

1 PANGI = 1 billion scales
```

### Social Media

```
🦎 Fun Fact!

PANGI tokens are measured in SCALES!

1 PANGI = 1,000,000,000 scales

Each scale protects pangolins 🛡️

#PANGI #Scales #Conservation
```

### Explainer Video Script

```
"When you hold PANGI, you're holding scales.

Not just any scales - protective scales 
that help save pangolins.

1 PANGI equals 1 billion scales.

The more scales you collect, 
the more pangolins you protect."
```

---

## 🎯 Best Practices

### DO ✅

- Show scales for amounts < 0.001 PANGI
- Use scales for fees and micro-transactions
- Add tooltips explaining scales
- Use ⚖️ emoji for scales
- Format large numbers (10T scales, not 10,000,000,000,000)

### DON'T ❌

- Don't show scales for large amounts (use PANGI)
- Don't use scales without context
- Don't forget the ⚖️ emoji
- Don't use scientific notation
- Don't hide the conversion

---

## 📚 Glossary

**PANGI**: The main token unit (like BTC)  
**Scales**: The smallest unit (like satoshis)  
**1 PANGI**: 1,000,000,000 scales  
**1 scale**: 0.000000001 PANGI  
**Decimals**: 9 (standard for Solana)  
**Symbol**: ⚖️ (scales emoji)  

---

## 🔗 Related Documentation

- [PANGI Tokenomics](./DUAL_TOKEN_MODEL.md)
- [Token Integration](./CATH_INTEGRATION.md)
- [Smart Contracts](./NFT_SMART_CONTRACT_SPEC.md)
- [Frontend Guide](./SOLANA_INTEGRATION_COMPLETE.md)

---

## 🎉 Summary

**Scales** make PANGI tokens:
- ✅ More memorable
- ✅ More precise
- ✅ More thematic
- ✅ More educational
- ✅ More engaging

**1 PANGI = 1 billion scales ⚖️**

Every scale protects pangolins! 🦎
