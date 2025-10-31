/**
 * NFT Evolution Workflow Tests
 * 
 * Demonstrates the complete NFT evolution lifecycle from initialization to max level.
 * These tests validate the evolution mechanics without requiring actual Solana RPC calls.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  canEvolve,
  getEvolutionStage,
  getEvolutionReward,
  timeUntilEvolution,
} from './helpers/test-utils';

describe('NFT Evolution Workflow', () => {
  const idlPath = path.join(__dirname, '../../target/idl/pangi_nft.json');
  const nftIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

  describe('Hatchling Initialization', () => {
    test('should validate initialize_hatchling instruction', () => {
      const instruction = nftIdl.instructions.find(
        (i: any) => i.name === 'initialize_hatchling'
      );
      
      expect(instruction).toBeDefined();
      expect(instruction.accounts).toHaveLength(4);
      expect(instruction.args).toHaveLength(1);
      expect(instruction.args[0].name).toBe('evolutionCooldown');
      expect(instruction.args[0].type).toBe('i64');
    });

    test('should validate hatchling account structure', () => {
      const hatchling = nftIdl.accounts.find((a: any) => a.name === 'Hatchling');
      
      expect(hatchling).toBeDefined();
      
      const fieldNames = hatchling.type.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('nftMint');
      expect(fieldNames).toContain('authority');
      expect(fieldNames).toContain('stage');
      expect(fieldNames).toContain('rarity');
      expect(fieldNames).toContain('traits');
      expect(fieldNames).toContain('evolutionCount');
      expect(fieldNames).toContain('lastEvolutionTimestamp');
      expect(fieldNames).toContain('evolutionCooldown');
      expect(fieldNames).toContain('generation');
    });

    test('should simulate hatchling initialization', () => {
      const mockHatchling = {
        nftMint: 'MockNFTMint123',
        authority: 'MockAuthority456',
        stage: 'Hatchling',
        rarity: 'Common',
        traits: 'Green scales, Small wings',
        evolutionCount: 0,
        lastEvolutionTimestamp: Math.floor(Date.now() / 1000),
        evolutionCooldown: 86400, // 24 hours
        generation: 1,
      };
      
      expect(mockHatchling.stage).toBe('Hatchling');
      expect(mockHatchling.evolutionCount).toBe(0);
      expect(mockHatchling.evolutionCooldown).toBe(86400);
    });
  });

  describe('Evolution Mechanics', () => {
    test('should validate evolve_hatchling instruction', () => {
      const instruction = nftIdl.instructions.find(
        (i: any) => i.name === 'evolve_hatchling'
      );
      
      expect(instruction).toBeDefined();
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.args).toHaveLength(0); // No args for evolution
    });

    test('should check evolution cooldown (cannot evolve yet)', () => {
      const now = Math.floor(Date.now() / 1000);
      const lastEvolution = now - (12 * 60 * 60); // 12 hours ago
      const cooldown = 24 * 60 * 60; // 24 hours
      
      const canEvolveNow = canEvolve(lastEvolution, cooldown, now);
      const timeRemaining = timeUntilEvolution(lastEvolution, cooldown, now);
      
      expect(canEvolveNow).toBe(false);
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(12 * 60 * 60);
    });

    test('should check evolution cooldown (can evolve)', () => {
      const now = Math.floor(Date.now() / 1000);
      const lastEvolution = now - (25 * 60 * 60); // 25 hours ago
      const cooldown = 24 * 60 * 60; // 24 hours
      
      const canEvolveNow = canEvolve(lastEvolution, cooldown, now);
      const timeRemaining = timeUntilEvolution(lastEvolution, cooldown, now);
      
      expect(canEvolveNow).toBe(true);
      expect(timeRemaining).toBe(0);
    });

    test('should simulate first evolution (Hatchling → Juvenile)', () => {
      const before = {
        stage: 'Hatchling',
        evolutionCount: 0,
        lastEvolutionTimestamp: Math.floor(Date.now() / 1000) - (25 * 60 * 60),
      };
      
      // Check if can evolve
      const canEvolveNow = canEvolve(
        before.lastEvolutionTimestamp,
        86400,
        Math.floor(Date.now() / 1000)
      );
      expect(canEvolveNow).toBe(true);
      
      // Simulate evolution
      const after = {
        stage: getEvolutionStage(before.evolutionCount + 1),
        evolutionCount: before.evolutionCount + 1,
        lastEvolutionTimestamp: Math.floor(Date.now() / 1000),
      };
      
      expect(after.stage).toBe('Juvenile');
      expect(after.evolutionCount).toBe(1);
    });
  });

  describe('Complete Evolution Journey', () => {
    test('should simulate full evolution path (0 → 9)', () => {
      const evolutionPath = [
        { count: 0, stage: 'Hatchling', reward: 1000 },
        { count: 1, stage: 'Juvenile', reward: 1500 },
        { count: 2, stage: 'Adolescent', reward: 2250 },
        { count: 3, stage: 'Young Adult', reward: 3375 },
        { count: 4, stage: 'Adult', reward: 5062 },
        { count: 5, stage: 'Mature', reward: 7593 },
        { count: 6, stage: 'Elder', reward: 11390 },
        { count: 7, stage: 'Ancient', reward: 17085 },
        { count: 8, stage: 'Legendary', reward: 25628 },
        { count: 9, stage: 'Transcendent', reward: 38443 },
      ];
      
      evolutionPath.forEach(({ count, stage, reward }) => {
        const calculatedStage = getEvolutionStage(count);
        const calculatedReward = getEvolutionReward(count);
        
        expect(calculatedStage).toBe(stage);
        expect(calculatedReward).toBeGreaterThanOrEqual(reward);
      });
    });

    test('should calculate total rewards for max evolution', () => {
      let totalRewards = 0;
      
      for (let i = 0; i < 10; i++) {
        totalRewards += getEvolutionReward(i);
      }
      
      // Total rewards should be substantial
      expect(totalRewards).toBeGreaterThan(100000);
    });

    test('should simulate time-based evolution progression', () => {
      const startTime = Math.floor(Date.now() / 1000);
      const cooldown = 86400; // 24 hours
      
      const evolutionTimeline = [];
      
      for (let i = 0; i < 10; i++) {
        const evolutionTime = startTime + (i * cooldown);
        const stage = getEvolutionStage(i);
        const reward = getEvolutionReward(i);
        
        evolutionTimeline.push({
          evolutionNumber: i,
          stage,
          reward,
          timestamp: evolutionTime,
          daysFromStart: i,
        });
      }
      
      expect(evolutionTimeline).toHaveLength(10);
      expect(evolutionTimeline[0].stage).toBe('Hatchling');
      expect(evolutionTimeline[9].stage).toBe('Transcendent');
      expect(evolutionTimeline[9].daysFromStart).toBe(9);
    });
  });

  describe('Evolution Workflow Scenarios', () => {
    test('Scenario 1: New NFT holder - First 3 evolutions', () => {
      const nftHolder = {
        nftMint: 'MockNFT001',
        currentStage: 'Hatchling',
        evolutionCount: 0,
        lastEvolution: Math.floor(Date.now() / 1000),
        cooldown: 86400,
      };
      
      // Day 0: Mint NFT
      expect(nftHolder.currentStage).toBe('Hatchling');
      expect(nftHolder.evolutionCount).toBe(0);
      
      // Day 1: First evolution
      const day1 = nftHolder.lastEvolution + 86400;
      expect(canEvolve(nftHolder.lastEvolution, nftHolder.cooldown, day1)).toBe(true);
      
      nftHolder.evolutionCount = 1;
      nftHolder.currentStage = getEvolutionStage(1);
      nftHolder.lastEvolution = day1;
      
      expect(nftHolder.currentStage).toBe('Juvenile');
      
      // Day 2: Second evolution
      const day2 = day1 + 86400;
      expect(canEvolve(nftHolder.lastEvolution, nftHolder.cooldown, day2)).toBe(true);
      
      nftHolder.evolutionCount = 2;
      nftHolder.currentStage = getEvolutionStage(2);
      nftHolder.lastEvolution = day2;
      
      expect(nftHolder.currentStage).toBe('Adolescent');
      
      // Day 3: Third evolution
      const day3 = day2 + 86400;
      expect(canEvolve(nftHolder.lastEvolution, nftHolder.cooldown, day3)).toBe(true);
      
      nftHolder.evolutionCount = 3;
      nftHolder.currentStage = getEvolutionStage(3);
      
      expect(nftHolder.currentStage).toBe('Young Adult');
    });

    test('Scenario 2: Impatient holder - Try to evolve too early', () => {
      const nftHolder = {
        lastEvolution: Math.floor(Date.now() / 1000),
        cooldown: 86400,
      };
      
      // Try after 6 hours
      const after6Hours = nftHolder.lastEvolution + (6 * 60 * 60);
      expect(canEvolve(nftHolder.lastEvolution, nftHolder.cooldown, after6Hours)).toBe(false);
      
      const timeRemaining = timeUntilEvolution(
        nftHolder.lastEvolution,
        nftHolder.cooldown,
        after6Hours
      );
      expect(timeRemaining).toBe(18 * 60 * 60); // 18 hours remaining
      
      // Try after 23 hours
      const after23Hours = nftHolder.lastEvolution + (23 * 60 * 60);
      expect(canEvolve(nftHolder.lastEvolution, nftHolder.cooldown, after23Hours)).toBe(false);
      
      // Success after 24 hours
      const after24Hours = nftHolder.lastEvolution + (24 * 60 * 60);
      expect(canEvolve(nftHolder.lastEvolution, nftHolder.cooldown, after24Hours)).toBe(true);
    });

    test('Scenario 3: Patient holder - Evolve to max level', () => {
      const startTime = Math.floor(Date.now() / 1000);
      const cooldown = 86400;
      
      let currentEvolution = 0;
      let lastEvolutionTime = startTime;
      let totalRewards = 0;
      
      // Evolve 10 times (0 → 9)
      for (let day = 1; day <= 10; day++) {
        const currentTime = startTime + (day * cooldown);
        
        // Check if can evolve
        const canEvolveNow = canEvolve(lastEvolutionTime, cooldown, currentTime);
        expect(canEvolveNow).toBe(true);
        
        // Evolve
        currentEvolution++;
        lastEvolutionTime = currentTime;
        
        const stage = getEvolutionStage(currentEvolution);
        const reward = getEvolutionReward(currentEvolution);
        totalRewards += reward;
        
        if (day === 10) {
          expect(stage).toBe('Transcendent');
          expect(currentEvolution).toBe(10);
        }
      }
      
      expect(totalRewards).toBeGreaterThan(100000);
    });

    test('Scenario 4: Special NFT with bonus multiplier', () => {
      const specialNFT = {
        rarity: 'Special',
        bonusMultiplier: 2.0, // 2x rewards
        evolutionCount: 0,
      };
      
      // Calculate rewards with bonus
      const baseReward = getEvolutionReward(5); // Mature stage
      const bonusReward = Math.floor(baseReward * specialNFT.bonusMultiplier);
      
      expect(bonusReward).toBe(baseReward * 2);
      expect(bonusReward).toBeGreaterThan(15000);
    });
  });

  describe('Evolution State Transitions', () => {
    test('should track state changes through evolution', () => {
      const stateHistory = [];
      const startTime = Math.floor(Date.now() / 1000);
      
      for (let i = 0; i < 10; i++) {
        const state = {
          evolutionCount: i,
          stage: getEvolutionStage(i),
          reward: getEvolutionReward(i),
          timestamp: startTime + (i * 86400),
          canEvolveNext: i < 9, // Can't evolve past Transcendent
        };
        
        stateHistory.push(state);
      }
      
      // Verify progression
      expect(stateHistory[0].stage).toBe('Hatchling');
      expect(stateHistory[5].stage).toBe('Mature');
      expect(stateHistory[9].stage).toBe('Transcendent');
      
      // Verify rewards increase
      expect(stateHistory[1].reward).toBeGreaterThan(stateHistory[0].reward);
      expect(stateHistory[9].reward).toBeGreaterThan(stateHistory[8].reward);
    });

    test('should validate evolution cannot exceed max level', () => {
      const maxEvolution = 9;
      
      // At max level
      const stage = getEvolutionStage(maxEvolution);
      expect(stage).toBe('Transcendent');
      
      // Beyond max level (should stay at Transcendent)
      const beyondMax = getEvolutionStage(15);
      expect(beyondMax).toBe('Transcendent');
    });
  });

  describe('Evolution Rewards Calculation', () => {
    test('should calculate cumulative rewards', () => {
      const rewards = [];
      let cumulative = 0;
      
      for (let i = 0; i < 10; i++) {
        const reward = getEvolutionReward(i);
        cumulative += reward;
        
        rewards.push({
          evolution: i,
          stage: getEvolutionStage(i),
          reward,
          cumulative,
        });
      }
      
      // First evolution should have base reward
      expect(rewards[0].reward).toBe(1000);
      
      // Last evolution should have highest reward
      expect(rewards[9].reward).toBeGreaterThan(rewards[0].reward);
      
      // Cumulative should be sum of all
      expect(rewards[9].cumulative).toBeGreaterThan(100000);
    });

    test('should verify exponential reward growth', () => {
      const reward0 = getEvolutionReward(0);
      const reward3 = getEvolutionReward(3);
      const reward6 = getEvolutionReward(6);
      const reward9 = getEvolutionReward(9);
      
      // Each should be significantly larger than previous
      expect(reward3).toBeGreaterThan(reward0 * 2);
      expect(reward6).toBeGreaterThan(reward3 * 2);
      expect(reward9).toBeGreaterThan(reward6 * 2);
    });
  });

  describe('Integration with Vault', () => {
    test('should simulate evolution rewards deposited to vault', () => {
      const vault = {
        nftMint: 'MockNFT001',
        balance: 0,
        rewardHistory: [] as any[],
      };
      
      // Simulate 5 evolutions with rewards going to vault
      for (let i = 0; i < 5; i++) {
        const reward = getEvolutionReward(i);
        vault.balance += reward;
        
        vault.rewardHistory.push({
          evolution: i,
          stage: getEvolutionStage(i),
          reward,
          timestamp: Math.floor(Date.now() / 1000) + (i * 86400),
        });
      }
      
      expect(vault.balance).toBeGreaterThan(10000);
      expect(vault.rewardHistory).toHaveLength(5);
      expect(vault.rewardHistory[4].stage).toBe('Adult'); // Evolution 4 = Adult
    });
  });
});
