# PANGI Ecosystem Token Flow Diagrams

## Overview

Visual representation of how $PANGI and $CATH tokens flow through the ecosystem.

---

## 1. Dual Token System

```
┌─────────────────────────────────────────────────────────┐
│                    PANGI ECOSYSTEM                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │     $PANGI       │         │      $CATH       │     │
│  │  Governance &    │         │   Utility &      │     │
│  │  Value Token     │         │  Rewards Token   │     │
│  └──────────────────┘         └──────────────────┘     │
│          │                             │                │
│          │                             │                │
│  Fixed Supply (1B)          Inflationary (100M+)       │
│  Deflationary Burns         High Burn Rate (50%)       │
│  Price Appreciation         Stable Price Target        │
│  Governance Rights          No Governance              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. NFT Unlock Flow

```
User owns Pangopup #42
         │
         ▼
    [Decision]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Wait for    Pay 10,000
50% mint    $CATH now
    │         │
    │         ▼
    │    Smart Contract
    │         │
    │    ┌────┼────┐
    │    │    │    │
    │    ▼    ▼    ▼
    │  50%  30%  20%
    │  Burn Stake Treas
    │         │
    └────┬────┘
         ▼
   Adult #1542
   Airdropped
```

---

## 3. Staking Rewards Flow

```
┌─────────────────────────────────────────┐
│         STAKING REWARDS POOL            │
│         (50M $CATH initial)             │
└──────────────┬──────────────────────────┘
               │
        Daily Emission
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
NFT Stake  PANGI Stake  LP Mining
10 CATH/d  50% APY     100% APY
    │          │          │
    └──────────┼──────────┘
               ▼
          User Wallet
```

---

## 4. $CATH Burn Mechanics

```
User Action (Unlock/Breed/Buy)
         │
         ▼
    Pay $CATH
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
  50%  30%  20%
  Burn Stake Treas
    │    │    │
    │    │    └──> Development
    │    └──────> Rewards Pool
    └──────────> Burned Forever
                 (Deflationary)
```

---

## 5. Value Accrual to $PANGI

```
$CATH Fees Collected
         │
         ▼
    Treasury (20%)
         │
         ▼
   Quarterly Event
         │
    ┌────┼────┐
    │         │
    ▼         ▼
Swap CATH  Buy PANGI
to SOL     with SOL
    │         │
    └────┬────┘
         ▼
    Burn PANGI
         │
         ▼
  PANGI Supply ↓
  PANGI Price ↑
```

---

## 6. Complete Ecosystem Flow

```
        ┌──────────────┐
        │    USERS     │
        └──────┬───────┘
               │
        ┌──────┼──────┐
        │      │      │
        ▼      ▼      ▼
      Mint   Stake  Trade
      NFTs   Tokens  NFTs
        │      │      │
        └──────┼──────┘
               ▼
        ┌──────────────┐
        │  ECOSYSTEM   │
        │   REVENUE    │
        └──────┬───────┘
               │
        ┌──────┼──────┐
        │      │      │
        ▼      ▼      ▼
     Burn   Rewards  Dev
     50%     30%     20%
```

---

## Summary

**$PANGI**: Governance, value storage, appreciates  
**$CATH**: Utility, rewards, stable price  
**Integration**: $CATH fees → Buy & burn $PANGI  
**Result**: Sustainable dual-token economy  

