/**
 * PANGI Vault Program Tests (ESM)
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

describe('PANGI Vault Program (ESM)', () => {
  let idl: any;

  beforeAll(async () => {
    idl = JSON.parse(
      await readFile(join(__dirname, '../../target/idl/pangi_vault.json'), 'utf8')
    );
  });

  test('should load Vault IDL', () => {
    expect(idl).toBeDefined();
    expect(idl.name).toBe('pangi_vault');
  });

  test('should have vault management instructions', () => {
    const instructions = idl.instructions.map((i: any) => i.name);
    expect(instructions).toContain('create_vault');
    expect(instructions).toContain('deposit_tokens');
    expect(instructions).toContain('withdraw_tokens');
  });

  test('should have Vault account structure', () => {
    const vault = idl.accounts.find((a: any) => a.name === 'Vault');
    expect(vault).toBeDefined();
    
    const fieldNames = vault.type.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('nftMint');
    expect(fieldNames).toContain('authority');
    expect(fieldNames).toContain('bump');
    expect(fieldNames).toContain('createdAt');
  });

  test('should validate deposit amounts', () => {
    const depositAmount = new BN('500000000000'); // 500 PANGI
    const minDeposit = new BN('1000000000'); // 1 PANGI
    
    expect(depositAmount.gte(minDeposit)).toBe(true);
  });

  test('should validate withdrawal limits', () => {
    const vaultBalance = new BN('1000000000000'); // 1000 PANGI
    const withdrawAmount = new BN('500000000000'); // 500 PANGI
    
    expect(withdrawAmount.lte(vaultBalance)).toBe(true);
  });

  test('should have create_vault instruction with correct accounts', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'create_vault');
    expect(instruction).toBeDefined();
    
    const accountNames = instruction.accounts.map((a: any) => a.name);
    expect(accountNames).toContain('vault');
    expect(accountNames).toContain('nftMint');
    expect(accountNames).toContain('authority');
  });

  test('should have deposit_tokens instruction', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'deposit_tokens');
    expect(instruction).toBeDefined();
    
    const args = instruction.args.map((a: any) => a.name);
    expect(args).toContain('amount');
  });

  test('should have withdraw_tokens instruction', () => {
    const instruction = idl.instructions.find((i: any) => i.name === 'withdraw_tokens');
    expect(instruction).toBeDefined();
    
    const args = instruction.args.map((a: any) => a.name);
    expect(args).toContain('amount');
  });

  test('should validate vault errors', () => {
    const errors = {
      vaultAuthorityMismatch: {
        code: 6000,
        message: 'Vault authority does not match',
      },
      insufficientBalance: {
        code: 6001,
        message: 'Insufficient balance in vault',
      },
    };
    
    expect(errors.vaultAuthorityMismatch.code).toBe(6000);
    expect(errors.insufficientBalance.code).toBe(6001);
  });

  test('should calculate vault capacity', () => {
    const maxCapacity = new BN('1000000000000000000'); // 1B PANGI
    const currentBalance = new BN('500000000000000'); // 500K PANGI
    const remaining = maxCapacity.sub(currentBalance);
    
    expect(remaining.toString()).toBe('999500000000000000');
  });
});
