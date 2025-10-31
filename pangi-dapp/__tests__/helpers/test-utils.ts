/**
 * Test Utilities for PANGI Programs
 * 
 * Helper functions for testing cross-program interactions
 * Note: Avoids Solana/Anchor imports to prevent ESM issues in Jest
 */

/**
 * Calculate tax amount based on transfer type
 */
export function calculateTax(amount: number, taxRateBps: number): number {
  return Math.floor((amount * taxRateBps) / 10000);
}

/**
 * Calculate distribution breakdown (50% burn, 25% vest, 25% liquid)
 */
export function calculateDistribution(totalAmount: number) {
  return {
    total: totalAmount,
    burned: Math.floor(totalAmount * 0.5),
    vested: Math.floor(totalAmount * 0.25),
    liquid: Math.floor(totalAmount * 0.25),
  };
}

/**
 * Check if evolution cooldown has passed
 */
export function canEvolve(
  lastEvolutionTimestamp: number,
  cooldownSeconds: number,
  currentTimestamp?: number
): boolean {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  return now >= lastEvolutionTimestamp + cooldownSeconds;
}

/**
 * Calculate time remaining until evolution is available
 */
export function timeUntilEvolution(
  lastEvolutionTimestamp: number,
  cooldownSeconds: number,
  currentTimestamp?: number
): number {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const nextEvolutionTime = lastEvolutionTimestamp + cooldownSeconds;
  return Math.max(0, nextEvolutionTime - now);
}

/**
 * Determine transfer type based on amount and recipient
 */
export function getTransferType(
  amount: number,
  whaleThreshold: number,
  isExchange: boolean,
  isReward: boolean
): 'PeerToPeer' | 'ExchangeDeposit' | 'ConservationReward' | 'LargeWhale' {
  if (isReward) return 'ConservationReward';
  if (isExchange) return 'ExchangeDeposit';
  if (amount > whaleThreshold) return 'LargeWhale';
  return 'PeerToPeer';
}

/**
 * Get tax rate for transfer type
 */
export function getTaxRate(transferType: string): number {
  const rates: Record<string, number> = {
    PeerToPeer: 100, // 1%
    ExchangeDeposit: 50, // 0.5%
    ConservationReward: 0, // 0%
    LargeWhale: 200, // 2%
  };
  return rates[transferType] || 100;
}

/**
 * Convert PANGI amount to lamports (9 decimals)
 * Returns as number to avoid BN dependency
 */
export function pangiToLamports(amount: number): number {
  return amount * 1_000_000_000;
}

/**
 * Convert lamports to PANGI amount
 */
export function lamportsToPangi(lamports: number): number {
  return lamports / 1_000_000_000;
}

/**
 * Format PANGI amount for display
 */
export function formatPangi(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calculate evolution stage based on count
 */
export function getEvolutionStage(evolutionCount: number): string {
  const stages = [
    'Hatchling',
    'Juvenile',
    'Adolescent',
    'Young Adult',
    'Adult',
    'Mature',
    'Elder',
    'Ancient',
    'Legendary',
    'Transcendent',
  ];
  return stages[Math.min(evolutionCount, stages.length - 1)];
}

/**
 * Calculate evolution rewards based on stage
 */
export function getEvolutionReward(evolutionCount: number): number {
  // Base reward increases with each evolution
  const baseReward = 1000;
  const multiplier = Math.pow(1.5, evolutionCount);
  return Math.floor(baseReward * multiplier);
}

/**
 * Check if distribution is active
 */
export function isDistributionActive(
  startTimestamp: number,
  endTimestamp: number,
  currentTimestamp?: number
): boolean {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  return now >= startTimestamp && now <= endTimestamp;
}

/**
 * Calculate vesting schedule
 */
export function calculateVesting(
  totalAmount: number,
  startTimestamp: number,
  endTimestamp: number,
  currentTimestamp?: number
): {
  total: number;
  vested: number;
  remaining: number;
  percentVested: number;
} {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const duration = endTimestamp - startTimestamp;
  const elapsed = Math.max(0, Math.min(now - startTimestamp, duration));
  const percentVested = duration > 0 ? (elapsed / duration) * 100 : 0;
  const vested = Math.floor((totalAmount * elapsed) / duration);
  
  return {
    total: totalAmount,
    vested,
    remaining: totalAmount - vested,
    percentVested,
  };
}

/**
 * Test data generators
 */
export const TestData = {
  /**
   * Generate test NFT mint address (mock)
   */
  nftMint: () => 'MockNFTMint' + Math.random().toString(36).substring(7),
  
  /**
   * Generate test token mint
   */
  tokenMint: () => '6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be',
  
  /**
   * Generate test authority (mock)
   */
  authority: () => ({ publicKey: 'MockAuthority' + Math.random().toString(36).substring(7) }),
  
  /**
   * Generate test amount
   */
  amount: (min: number = 100, max: number = 10000) => 
    Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Assertion helpers
 */
export const Assertions = {
  /**
   * Assert tax calculation is correct
   */
  assertTaxCalculation: (
    amount: number,
    taxRate: number,
    expectedTax: number
  ) => {
    const calculatedTax = calculateTax(amount, taxRate);
    if (calculatedTax !== expectedTax) {
      throw new Error(
        `Tax calculation mismatch: expected ${expectedTax}, got ${calculatedTax}`
      );
    }
  },
  
  /**
   * Assert distribution breakdown is correct
   */
  assertDistribution: (
    total: number,
    burned: number,
    vested: number,
    liquid: number
  ) => {
    const expected = calculateDistribution(total);
    if (
      burned !== expected.burned ||
      vested !== expected.vested ||
      liquid !== expected.liquid
    ) {
      throw new Error('Distribution breakdown mismatch');
    }
  },
};
