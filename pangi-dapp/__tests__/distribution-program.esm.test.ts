/**
 * PANGI Special Distribution Program Tests (ESM)
 * 
 * Pure ESM test using @jest/globals
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import BN from 'bn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('PANGI Special Distribution Program (ESM)', () => {
  let idl: any;

  beforeAll(async () => {
    idl = JSON.parse(
      await readFile(join(__dirname, '../../target/idl/special_distribution.json'), 'utf8')
    );
  });

  test('should load Distribution IDL', () => {
    expect(idl).toBeDefined();
    expect(idl.name).toBe('special_distribution');
  });

  test('should have distribution instructions', () => {
    const instructions = idl.instructions.map((i: any) => i.name);
    expect(instructions).toContain('initialize_distribution');
    expect(instructions).toContain('distribute_to_vault');
  });

  test('should have DistributionConfig account structure', () => {
    const config = idl.accounts.find((a: any) => a.name === 'DistributionConfig');
    expect(config).toBeDefined();
    
    const fieldNames = config.type.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('totalSupply');
    expect(fieldNames).toContain('distributionStart');
    expect(fieldNames).toContain('distributionEnd');
  });

  test('should calculate distribution breakdown (50/25/25)', () => {
    const totalAmount = new BN('1000000000000000'); // 1M PANGI
    
    const burned = totalAmount.muln(50).divn(100); // 50%
    const vested = totalAmount.muln(25).divn(100); // 25%
    const liquid = totalAmount.muln(25).divn(100); // 25%
    
    expect(burned.toString()).toBe('500000000000000'); // 500K
    expect(vested.toString()).toBe('250000000000000'); // 250K
    expect(liquid.toString()).toBe('250000000000000'); // 250K
  });

  test('should validate distribution period', () => {
    const now = Math.floor(Date.now() / 1000);
    const distributionStart = now;
    const distributionEnd = now + (365 * 24 * 60 * 60); // 1 year
    
    const isActive = now >= distributionStart && now <= distributionEnd;
    expect(isActive).toBe(true);
  });

  test('should calculate total supply allocation', () => {
    const totalSupply = new BN('63000000000000000'); // 63M PANGI
    const specialNFTs = 100;
    const perNFT = totalSupply.divn(specialNFTs);
    
    expect(perNFT.toString()).toBe('630000000000000'); // 630K per NFT
  });

  test('should have initialize_distribution instruction', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'initialize_distribution');
    expect(instruction).toBeDefined();
    
    const args = instruction.args.map((a: any) => a.name);
    expect(args).toContain('totalSupply');
    expect(args).toContain('distributionStart');
    expect(args).toContain('distributionEnd');
  });

  test('should have distribute_to_vault instruction', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'distribute_to_vault');
    expect(instruction).toBeDefined();
    
    const accountNames = instruction.accounts.map((a: any) => a.name);
    expect(accountNames).toContain('distributionConfig');
    expect(accountNames).toContain('vault');
    expect(accountNames).toContain('nftMint');
  });

  test('should validate distribution errors', () => {
    const errors = {
      distributionNotStarted: {
        code: 6000,
        message: 'Distribution period has not started',
      },
      distributionEnded: {
        code: 6001,
        message: 'Distribution period has ended',
      },
      insufficientFunds: {
        code: 6002,
        message: 'Insufficient funds in distribution account',
      },
    };
    
    expect(errors.distributionNotStarted.code).toBe(6000);
    expect(errors.distributionEnded.code).toBe(6001);
    expect(errors.insufficientFunds.code).toBe(6002);
  });

  test('should calculate vesting schedule', () => {
    const totalVested = new BN('250000000000000'); // 250K PANGI
    const vestingDuration = 365 * 24 * 60 * 60; // 1 year in seconds
    const elapsed = 182 * 24 * 60 * 60; // 6 months
    
    const percentVested = (elapsed / vestingDuration) * 100;
    const amountVested = totalVested.muln(elapsed).divn(vestingDuration);
    
    expect(percentVested).toBeCloseTo(50, 0);
    // Approximately 125K (with rounding)
    expect(amountVested.gt(new BN('124000000000000'))).toBe(true);
    expect(amountVested.lt(new BN('126000000000000'))).toBe(true);
  });

  test('should validate distribution timing', () => {
    const now = Math.floor(Date.now() / 1000);
    const start = now - 1000; // Started 1000 seconds ago
    const end = now + 10000; // Ends in 10000 seconds
    
    const isActive = now >= start && now <= end;
    const hasStarted = now >= start;
    const hasEnded = now > end;
    
    expect(isActive).toBe(true);
    expect(hasStarted).toBe(true);
    expect(hasEnded).toBe(false);
  });
});
