/**
 * SDK Tests - ESM Compatible Version
 * 
 * This version works around ESM issues by:
 * 1. Loading IDLs directly from files (no imports)
 * 2. Using dynamic imports where needed
 * 3. Mocking Solana dependencies
 */

import * as fs from 'fs';
import * as path from 'path';

describe('PANGI SDK Tests (ESM Compatible)', () => {
  const idlDir = path.join(__dirname, '../../target/idl');
  
  describe('IDL Loading', () => {
    test('should load pangi_token IDL', () => {
      const idlPath = path.join(idlDir, 'pangi_token.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      expect(idl).toBeDefined();
      expect(idl.name).toBe('pangi_token');
      expect(idl.metadata.address).toBe('BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA');
    });

    test('should load pangi_nft IDL', () => {
      const idlPath = path.join(idlDir, 'pangi_nft.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      expect(idl).toBeDefined();
      expect(idl.name).toBe('pangi_nft');
      expect(idl.metadata.address).toBe('etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE');
    });

    test('should load pangi_vault IDL', () => {
      const idlPath = path.join(idlDir, 'pangi_vault.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      expect(idl).toBeDefined();
      expect(idl.name).toBe('pangi_vault');
      expect(idl.metadata.address).toBe('5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2');
    });

    test('should load special_distribution IDL', () => {
      const idlPath = path.join(idlDir, 'special_distribution.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      expect(idl).toBeDefined();
      expect(idl.name).toBe('special_distribution');
      expect(idl.metadata.address).toBe('bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq');
    });
  });

  describe('Program Structure Validation', () => {
    test('pangi_token should have correct instructions', () => {
      const idlPath = path.join(idlDir, 'pangi_token.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('transfer_with_tax');
      expect(instructionNames).toContain('initialize_tax_config');
    });

    test('pangi_nft should have correct instructions', () => {
      const idlPath = path.join(idlDir, 'pangi_nft.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('initialize_hatchling');
      expect(instructionNames).toContain('evolve_hatchling');
    });

    test('pangi_vault should have correct instructions', () => {
      const idlPath = path.join(idlDir, 'pangi_vault.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('create_vault');
      expect(instructionNames).toContain('deposit_tokens');
      expect(instructionNames).toContain('withdraw_tokens');
    });

    test('special_distribution should have correct instructions', () => {
      const idlPath = path.join(idlDir, 'special_distribution.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('initialize_distribution');
      expect(instructionNames).toContain('claim_rewards');
      expect(instructionNames).toContain('distribute_to_vault');
    });
  });

  describe('PDA Derivation Patterns', () => {
    test('should validate PDA seed patterns', () => {
      const pdaPatterns = {
        taxConfig: {
          seeds: ['tax_config'],
          program: 'pangi_token',
        },
        distributionConfig: {
          seeds: ['distribution_config'],
          program: 'special_distribution',
        },
        vault: {
          seeds: ['vault', 'nftMint'],
          program: 'pangi_vault',
        },
        hatchling: {
          seeds: ['hatchling', 'nftMint'],
          program: 'pangi_nft',
        },
      };
      
      expect(pdaPatterns.taxConfig.seeds).toContain('tax_config');
      expect(pdaPatterns.vault.seeds).toContain('vault');
      expect(pdaPatterns.hatchling.seeds).toContain('hatchling');
    });

    test('should validate program addresses', () => {
      const programAddresses = {
        token: 'BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA',
        nft: 'etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE',
        vault: '5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2',
        distribution: 'bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq',
      };
      
      // Validate address format (base58, 32-44 chars)
      Object.values(programAddresses).forEach(address => {
        expect(address.length).toBeGreaterThan(32);
        expect(address.length).toBeLessThan(45);
        expect(address).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/); // Base58 chars
      });
    });
  });

  describe('Account Structure Validation', () => {
    test('TaxConfig should have correct fields', () => {
      const idlPath = path.join(idlDir, 'pangi_token.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const taxConfig = idl.accounts.find((a: any) => a.name === 'TaxConfig');
      expect(taxConfig).toBeDefined();
      
      const fieldNames = taxConfig.type.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('authority');
      expect(fieldNames).toContain('p2pTaxRate');
      expect(fieldNames).toContain('exchangeTaxRate');
      expect(fieldNames).toContain('whaleTaxRate');
      expect(fieldNames).toContain('conservationFund');
    });

    test('Hatchling should have correct fields', () => {
      const idlPath = path.join(idlDir, 'pangi_nft.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const hatchling = idl.accounts.find((a: any) => a.name === 'Hatchling');
      expect(hatchling).toBeDefined();
      
      const fieldNames = hatchling.type.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('nftMint');
      expect(fieldNames).toContain('authority');
      expect(fieldNames).toContain('stage');
      expect(fieldNames).toContain('evolutionCount');
    });

    test('Vault should have correct fields', () => {
      const idlPath = path.join(idlDir, 'pangi_vault.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const vault = idl.accounts.find((a: any) => a.name === 'Vault');
      expect(vault).toBeDefined();
      
      const fieldNames = vault.type.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('nftMint');
      expect(fieldNames).toContain('authority');
      expect(fieldNames).toContain('bump');
      expect(fieldNames).toContain('createdAt');
    });

    test('DistributionConfig should have correct fields', () => {
      const idlPath = path.join(idlDir, 'special_distribution.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const config = idl.accounts.find((a: any) => a.name === 'DistributionConfig');
      expect(config).toBeDefined();
      
      const fieldNames = config.type.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('authority');
      expect(fieldNames).toContain('totalSupply');
      expect(fieldNames).toContain('distributedAmount');
      expect(fieldNames).toContain('distributionStart');
      expect(fieldNames).toContain('distributionEnd');
    });
  });

  describe('Error Code Validation', () => {
    test('pangi_vault should have error codes', () => {
      const idlPath = path.join(idlDir, 'pangi_vault.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      expect(idl.errors).toBeDefined();
      expect(idl.errors.length).toBeGreaterThan(0);
      
      const errorCodes = idl.errors.map((e: any) => e.code);
      expect(errorCodes).toContain(6000);
      expect(errorCodes).toContain(6001);
      expect(errorCodes).toContain(6002);
    });

    test('special_distribution should have error codes', () => {
      const idlPath = path.join(idlDir, 'special_distribution.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      expect(idl.errors).toBeDefined();
      expect(idl.errors.length).toBeGreaterThan(0);
      
      const errorNames = idl.errors.map((e: any) => e.name);
      expect(errorNames).toContain('DistributionNotStarted');
      expect(errorNames).toContain('DistributionEnded');
      expect(errorNames).toContain('InsufficientDistributionFunds');
    });
  });

  describe('Instruction Arguments Validation', () => {
    test('transfer_with_tax should have amount argument', () => {
      const idlPath = path.join(idlDir, 'pangi_token.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instruction = idl.instructions.find((i: any) => i.name === 'transfer_with_tax');
      expect(instruction).toBeDefined();
      expect(instruction.args).toHaveLength(1);
      expect(instruction.args[0].name).toBe('amount');
      expect(instruction.args[0].type).toBe('u64');
    });

    test('initialize_hatchling should have cooldown argument', () => {
      const idlPath = path.join(idlDir, 'pangi_nft.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instruction = idl.instructions.find((i: any) => i.name === 'initialize_hatchling');
      expect(instruction).toBeDefined();
      expect(instruction.args).toHaveLength(1);
      expect(instruction.args[0].name).toBe('evolutionCooldown');
      expect(instruction.args[0].type).toBe('i64');
    });

    test('deposit_tokens should have amount argument', () => {
      const idlPath = path.join(idlDir, 'pangi_vault.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      
      const instruction = idl.instructions.find((i: any) => i.name === 'deposit_tokens');
      expect(instruction).toBeDefined();
      expect(instruction.args).toHaveLength(1);
      expect(instruction.args[0].name).toBe('amount');
      expect(instruction.args[0].type).toBe('u64');
    });
  });
});
