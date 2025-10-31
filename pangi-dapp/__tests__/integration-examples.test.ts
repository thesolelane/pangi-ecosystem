/**
 * Integration Test Examples
 * 
 * Practical examples of how to test cross-program interactions
 * These tests use the helper utilities and demonstrate real-world scenarios
 * 
 * Note: These tests avoid Solana/Anchor imports to prevent ESM issues
 */

import {
  calculateTax,
  calculateDistribution,
  canEvolve,
  getTransferType,
  getTaxRate,
  pangiToLamports,
  lamportsToPangi,
  getEvolutionStage,
  getEvolutionReward,
  isDistributionActive,
  calculateVesting,
  TestData,
  Assertions,
} from './helpers/test-utils';

describe('Integration Test Examples', () => {
  describe('Tax Calculation Examples', () => {
    test('P2P transfer: 1000 PANGI with 1% tax', () => {
      const amount = 1000;
      const taxRate = 100; // 1% = 100 basis points
      
      const tax = calculateTax(amount, taxRate);
      const recipient = amount - tax;
      
      expect(tax).toBe(10);
      expect(recipient).toBe(990);
      
      Assertions.assertTaxCalculation(amount, taxRate, 10);
    });

    test('Exchange deposit: 5000 PANGI with 0.5% tax', () => {
      const amount = 5000;
      const taxRate = 50; // 0.5% = 50 basis points
      
      const tax = calculateTax(amount, taxRate);
      const recipient = amount - tax;
      
      expect(tax).toBe(25);
      expect(recipient).toBe(4975);
    });

    test('Whale transfer: 15M PANGI with 2% tax', () => {
      const amount = 15_000_000;
      const taxRate = 200; // 2% = 200 basis points
      
      const tax = calculateTax(amount, taxRate);
      const recipient = amount - tax;
      
      expect(tax).toBe(300_000);
      expect(recipient).toBe(14_700_000);
    });

    test('Determine transfer type and calculate tax', () => {
      const amount = 12_000_000;
      const whaleThreshold = 10_000_000;
      
      const transferType = getTransferType(amount, whaleThreshold, false, false);
      const taxRate = getTaxRate(transferType);
      const tax = calculateTax(amount, taxRate);
      
      expect(transferType).toBe('LargeWhale');
      expect(taxRate).toBe(200);
      expect(tax).toBe(240_000);
    });
  });

  describe('Distribution Examples', () => {
    test('1M PANGI distribution breakdown', () => {
      const total = 1_000_000;
      const breakdown = calculateDistribution(total);
      
      expect(breakdown.burned).toBe(500_000); // 50%
      expect(breakdown.vested).toBe(250_000); // 25%
      expect(breakdown.liquid).toBe(250_000); // 25%
      
      Assertions.assertDistribution(
        total,
        breakdown.burned,
        breakdown.vested,
        breakdown.liquid
      );
    });

    test('5M PANGI distribution for tier 2 NFT', () => {
      const total = 5_000_000;
      const breakdown = calculateDistribution(total);
      
      expect(breakdown.burned).toBe(2_500_000);
      expect(breakdown.vested).toBe(1_250_000);
      expect(breakdown.liquid).toBe(1_250_000);
    });

    test('10M PANGI distribution for tier 3 NFT', () => {
      const total = 10_000_000;
      const breakdown = calculateDistribution(total);
      
      expect(breakdown.burned).toBe(5_000_000);
      expect(breakdown.vested).toBe(2_500_000);
      expect(breakdown.liquid).toBe(2_500_000);
    });
  });

  describe('NFT Evolution Examples', () => {
    test('Check if NFT can evolve after 24 hours', () => {
      const now = Math.floor(Date.now() / 1000);
      const lastEvolution = now - (25 * 60 * 60); // 25 hours ago
      const cooldown = 24 * 60 * 60; // 24 hours
      
      const canEvolveNow = canEvolve(lastEvolution, cooldown, now);
      
      expect(canEvolveNow).toBe(true);
    });

    test('Check if NFT cannot evolve before cooldown', () => {
      const now = Math.floor(Date.now() / 1000);
      const lastEvolution = now - (12 * 60 * 60); // 12 hours ago
      const cooldown = 24 * 60 * 60; // 24 hours
      
      const canEvolveNow = canEvolve(lastEvolution, cooldown, now);
      
      expect(canEvolveNow).toBe(false);
    });

    test('Evolution stages progression', () => {
      const stages = [
        { count: 0, expected: 'Hatchling' },
        { count: 1, expected: 'Juvenile' },
        { count: 2, expected: 'Adolescent' },
        { count: 5, expected: 'Mature' },
        { count: 9, expected: 'Transcendent' },
      ];
      
      stages.forEach(({ count, expected }) => {
        const stage = getEvolutionStage(count);
        expect(stage).toBe(expected);
      });
    });

    test('Evolution rewards increase with each stage', () => {
      const rewards = [
        { count: 0, min: 1000 },
        { count: 1, min: 1500 },
        { count: 2, min: 2250 },
        { count: 5, min: 7500 },
      ];
      
      rewards.forEach(({ count, min }) => {
        const reward = getEvolutionReward(count);
        expect(reward).toBeGreaterThanOrEqual(min);
      });
    });
  });

  describe('Vesting Examples', () => {
    test('Calculate vesting after 6 months (50% vested)', () => {
      const total = 1_000_000;
      const start = Math.floor(Date.now() / 1000);
      const end = start + (365 * 24 * 60 * 60); // 1 year
      const sixMonthsLater = start + (182 * 24 * 60 * 60); // ~6 months
      
      const vesting = calculateVesting(total, start, end, sixMonthsLater);
      
      expect(vesting.percentVested).toBeGreaterThan(49);
      expect(vesting.percentVested).toBeLessThan(51);
      expect(vesting.vested).toBeGreaterThan(490_000);
      expect(vesting.vested).toBeLessThan(510_000);
    });

    test('Calculate vesting at start (0% vested)', () => {
      const total = 1_000_000;
      const start = Math.floor(Date.now() / 1000);
      const end = start + (365 * 24 * 60 * 60);
      
      const vesting = calculateVesting(total, start, end, start);
      
      expect(vesting.percentVested).toBe(0);
      expect(vesting.vested).toBe(0);
      expect(vesting.remaining).toBe(total);
    });

    test('Calculate vesting at end (100% vested)', () => {
      const total = 1_000_000;
      const start = Math.floor(Date.now() / 1000);
      const end = start + (365 * 24 * 60 * 60);
      
      const vesting = calculateVesting(total, start, end, end);
      
      expect(vesting.percentVested).toBe(100);
      expect(vesting.vested).toBe(total);
      expect(vesting.remaining).toBe(0);
    });
  });

  describe('Distribution Period Examples', () => {
    test('Check if distribution is active', () => {
      const now = Math.floor(Date.now() / 1000);
      const start = now - (30 * 24 * 60 * 60); // Started 30 days ago
      const end = now + (335 * 24 * 60 * 60); // Ends in 335 days
      
      const isActive = isDistributionActive(start, end, now);
      
      expect(isActive).toBe(true);
    });

    test('Check if distribution has not started', () => {
      const now = Math.floor(Date.now() / 1000);
      const start = now + (7 * 24 * 60 * 60); // Starts in 7 days
      const end = start + (365 * 24 * 60 * 60);
      
      const isActive = isDistributionActive(start, end, now);
      
      expect(isActive).toBe(false);
    });

    test('Check if distribution has ended', () => {
      const now = Math.floor(Date.now() / 1000);
      const start = now - (400 * 24 * 60 * 60); // Started 400 days ago
      const end = now - (35 * 24 * 60 * 60); // Ended 35 days ago
      
      const isActive = isDistributionActive(start, end, now);
      
      expect(isActive).toBe(false);
    });
  });

  describe('Amount Conversion Examples', () => {
    test('Convert PANGI to lamports', () => {
      const amounts = [
        { pangi: 1, lamports: 1_000_000_000 },
        { pangi: 100, lamports: 100_000_000_000 },
        { pangi: 0.5, lamports: 500_000_000 },
      ];
      
      amounts.forEach(({ pangi, lamports }) => {
        const converted = pangiToLamports(pangi);
        expect(converted).toBe(lamports);
      });
    });

    test('Convert lamports to PANGI', () => {
      const amounts = [
        { lamports: 1_000_000_000, pangi: 1 },
        { lamports: 100_000_000_000, pangi: 100 },
        { lamports: 500_000_000, pangi: 0.5 },
      ];
      
      amounts.forEach(({ lamports, pangi }) => {
        const converted = lamportsToPangi(lamports);
        expect(converted).toBe(pangi);
      });
    });
  });

  describe('Complete User Journey Example', () => {
    test('Special NFT holder journey', () => {
      // Step 1: NFT minted with 5M PANGI allocation
      const allocation = 5_000_000;
      const distribution = calculateDistribution(allocation);
      
      expect(distribution.liquid).toBe(1_250_000); // 25% liquid
      expect(distribution.vested).toBe(1_250_000); // 25% vested
      expect(distribution.burned).toBe(2_500_000); // 50% burned
      
      // Step 2: User withdraws liquid tokens
      const withdrawn = distribution.liquid;
      const vaultBalance = 0; // All liquid withdrawn
      
      expect(withdrawn).toBe(1_250_000);
      expect(vaultBalance).toBe(0);
      
      // Step 3: User transfers 100K PANGI (P2P)
      const transferAmount = 100_000;
      const p2pTax = calculateTax(transferAmount, 100); // 1%
      const recipientReceives = transferAmount - p2pTax;
      
      expect(p2pTax).toBe(1_000);
      expect(recipientReceives).toBe(99_000);
      
      // Step 4: After 6 months, check vesting
      const now = Math.floor(Date.now() / 1000);
      const vestingStart = now - (182 * 24 * 60 * 60); // 6 months ago
      const vestingEnd = vestingStart + (365 * 24 * 60 * 60); // 1 year total
      
      const vesting = calculateVesting(
        distribution.vested,
        vestingStart,
        vestingEnd,
        now
      );
      
      expect(vesting.percentVested).toBeGreaterThan(49);
      expect(vesting.vested).toBeGreaterThan(600_000); // ~50% of 1.25M
      
      // Step 5: NFT evolves after cooldown
      const lastEvolution = now - (25 * 60 * 60); // 25 hours ago
      const cooldown = 24 * 60 * 60; // 24 hours
      const canEvolveNow = canEvolve(lastEvolution, cooldown, now);
      
      expect(canEvolveNow).toBe(true);
      
      // Step 6: Calculate evolution reward
      const evolutionCount = 3;
      const reward = getEvolutionReward(evolutionCount);
      const stage = getEvolutionStage(evolutionCount);
      
      expect(stage).toBe('Young Adult');
      expect(reward).toBeGreaterThan(3000);
    });
  });

  describe('Test Data Generation', () => {
    test('Generate test data', () => {
      const nftMint = TestData.nftMint();
      const tokenMint = TestData.tokenMint();
      const authority = TestData.authority();
      const amount = TestData.amount(100, 1000);
      
      expect(nftMint).toBeDefined();
      expect(tokenMint).toBe('6MP4zrGWf76FZpSCdEfGR5aw9QK6kZYecGRAqTUyL2be');
      expect(authority.publicKey).toBeDefined();
      expect(amount).toBeGreaterThanOrEqual(100);
      expect(amount).toBeLessThanOrEqual(1000);
    });
  });
});
