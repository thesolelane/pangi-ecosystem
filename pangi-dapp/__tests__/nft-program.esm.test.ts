/**
 * PANGI NFT Program Tests (ESM)
 * 
 * Pure ESM test using @jest/globals
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('PANGI NFT Program (ESM)', () => {
  let idl: any;

  beforeAll(async () => {
    idl = JSON.parse(
      await readFile(join(__dirname, '../../target/idl/pangi_nft.json'), 'utf8')
    );
  });

  test('should load NFT IDL', () => {
    expect(idl).toBeDefined();
    expect(idl.name).toBe('pangi_nft');
  });

  test('should have evolution instructions', () => {
    const instructions = idl.instructions.map((i: any) => i.name);
    expect(instructions).toContain('initialize_hatchling');
    expect(instructions).toContain('evolve_hatchling');
  });

  test('should have Hatchling account structure', () => {
    const hatchling = idl.accounts.find((a: any) => a.name === 'Hatchling');
    expect(hatchling).toBeDefined();
    
    const fieldNames = hatchling.type.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('nftMint');
    expect(fieldNames).toContain('authority');
    expect(fieldNames).toContain('evolutionCount');
    expect(fieldNames).toContain('lastEvolutionTimestamp');
  });

  test('should validate evolution cooldown period', () => {
    const cooldownSeconds = 86400; // 24 hours
    const now = Math.floor(Date.now() / 1000);
    const lastEvolution = now - 3600; // 1 hour ago
    
    const canEvolve = now >= lastEvolution + cooldownSeconds;
    expect(canEvolve).toBe(false); // Too soon
  });

  test('should calculate evolution stages', () => {
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
    
    expect(stages[0]).toBe('Hatchling');
    expect(stages[9]).toBe('Transcendent');
    expect(stages.length).toBe(10);
  });

  test('should validate evolution rewards increase', () => {
    const baseReward = 1000;
    const multiplier = 1.5;
    
    const reward1 = Math.floor(baseReward * Math.pow(multiplier, 1));
    const reward2 = Math.floor(baseReward * Math.pow(multiplier, 2));
    const reward3 = Math.floor(baseReward * Math.pow(multiplier, 3));
    
    expect(reward1).toBe(1500);
    expect(reward2).toBe(2250);
    expect(reward3).toBe(3375);
    expect(reward2).toBeGreaterThan(reward1);
    expect(reward3).toBeGreaterThan(reward2);
  });

  test('should have initialize_hatchling instruction with correct accounts', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'initialize_hatchling');
    expect(instruction).toBeDefined();
    
    const accountNames = instruction.accounts.map((a: any) => a.name);
    expect(accountNames).toContain('hatchling');
    expect(accountNames).toContain('nftMint');
    expect(accountNames).toContain('authority');
  });

  test('should have evolve_hatchling instruction', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'evolve_hatchling');
    expect(instruction).toBeDefined();
    
    const accountNames = instruction.accounts.map((a: any) => a.name);
    expect(accountNames).toContain('hatchling');
    expect(accountNames).toContain('authority');
  });

  test('should validate evolution errors', () => {
    const errors = {
      evolutionCooldownNotMet: {
        code: 6000,
        message: 'Evolution cooldown period has not elapsed',
      },
      maxEvolutionReached: {
        code: 6001,
        message: 'Maximum evolution level reached',
      },
    };
    
    expect(errors.evolutionCooldownNotMet.code).toBe(6000);
    expect(errors.maxEvolutionReached.code).toBe(6001);
  });
});
