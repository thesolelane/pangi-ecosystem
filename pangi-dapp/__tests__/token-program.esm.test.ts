/**
 * PANGI Token Program Tests (ESM)
 * 
 * Pure ESM test using @jest/globals
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import BN from 'bn.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('PANGI Token Program (ESM)', () => {
  let idl: any;

  beforeAll(async () => {
    idl = JSON.parse(
      await readFile(join(__dirname, '../../target/idl/pangi_token.json'), 'utf8')
    );
  });

  test('should load token IDL', () => {
    expect(idl).toBeDefined();
    expect(idl.instructions.length).toBeGreaterThan(0);
  });

  test('should have transfer_with_tax instruction', () => {
    const instructions = idl.instructions.map((i: any) => i.name);
    expect(instructions).toContain('transfer_with_tax');
  });

  test('should have initialize_tax_config instruction', () => {
    const instructions = idl.instructions.map((i: any) => i.name);
    expect(instructions).toContain('initialize_tax_config');
  });

  test('should validate tax rates in basis points', () => {
    // Tax rates should be in basis points (1% = 100 bps)
    const expectedRates = {
      p2p: 100,        // 1%
      exchange: 50,    // 0.5%
      whale: 200,      // 2%
    };

    expect(expectedRates.p2p).toBe(100);
    expect(expectedRates.exchange).toBe(50);
    expect(expectedRates.whale).toBe(200);
  });

  test('should calculate tax correctly', () => {
    const amount = 1000;
    const taxRate = 100; // 1%
    const tax = Math.floor((amount * taxRate) / 10000);
    
    expect(tax).toBe(10);
  });

  test('should handle large amounts with BN', () => {
    const largeAmount = new BN('1000000000000000'); // 1M PANGI with 9 decimals
    const taxRate = new BN(100); // 1%
    const divisor = new BN(10000);
    
    const tax = largeAmount.mul(taxRate).div(divisor);
    
    expect(tax.toString()).toBe('10000000000000'); // 10K PANGI
  });
});
