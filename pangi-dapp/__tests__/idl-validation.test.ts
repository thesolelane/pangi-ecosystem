import * as fs from 'fs';
import * as path from 'path';

describe('IDL File Validation', () => {
  const idlDir = path.join(__dirname, '../../target/idl');
  const expectedFiles = [
    'pangi_token.json',
    'pangi_nft.json',
    'pangi_vault.json',
    'special_distribution.json'
  ];

  describe('File Existence', () => {
    test('IDL directory should exist', () => {
      expect(fs.existsSync(idlDir)).toBe(true);
    });

    test.each(expectedFiles)('%s should exist', (filename) => {
      const filePath = path.join(idlDir, filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('JSON Validity', () => {
    test.each(expectedFiles)('%s should be valid JSON', (filename) => {
      const filePath = path.join(idlDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe('IDL Structure', () => {
    test.each(expectedFiles)('%s should have required fields', (filename) => {
      const filePath = path.join(idlDir, filename);
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      expect(idl).toHaveProperty('version');
      expect(idl).toHaveProperty('name');
      expect(idl).toHaveProperty('metadata');
      expect(idl).toHaveProperty('instructions');
      expect(idl.metadata).toHaveProperty('address');
    });

    test.each(expectedFiles)('%s should have valid program address', (filename) => {
      const filePath = path.join(idlDir, filename);
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const address = idl.metadata.address;
      expect(typeof address).toBe('string');
      expect(address.length).toBeGreaterThan(32);
      expect(address.length).toBeLessThan(45);
    });

    test.each(expectedFiles)('%s should have instructions array', (filename) => {
      const filePath = path.join(idlDir, filename);
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      expect(Array.isArray(idl.instructions)).toBe(true);
      expect(idl.instructions.length).toBeGreaterThan(0);
    });
  });

  describe('Program-Specific Validation', () => {
    test('pangi_token.json should have correct structure', () => {
      const filePath = path.join(idlDir, 'pangi_token.json');
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      expect(idl.name).toBe('pangi_token');
      expect(idl.metadata.address).toBe('BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA');
      expect(idl.instructions).toHaveLength(2);
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('transfer_with_tax');
      expect(instructionNames).toContain('initialize_tax_config');
    });

    test('pangi_nft.json should have correct structure', () => {
      const filePath = path.join(idlDir, 'pangi_nft.json');
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      expect(idl.name).toBe('pangi_nft');
      expect(idl.metadata.address).toBe('etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE');
      expect(idl.instructions).toHaveLength(2);
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('initialize_hatchling');
      expect(instructionNames).toContain('evolve_hatchling');
    });

    test('pangi_vault.json should have correct structure', () => {
      const filePath = path.join(idlDir, 'pangi_vault.json');
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      expect(idl.name).toBe('pangi_vault');
      expect(idl.metadata.address).toBe('5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2');
      expect(idl.instructions).toHaveLength(3);
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('create_vault');
      expect(instructionNames).toContain('deposit_tokens');
      expect(instructionNames).toContain('withdraw_tokens');
    });

    test('special_distribution.json should have correct structure', () => {
      const filePath = path.join(idlDir, 'special_distribution.json');
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      expect(idl.name).toBe('special_distribution');
      expect(idl.metadata.address).toBe('bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq');
      expect(idl.instructions).toHaveLength(3);
      
      const instructionNames = idl.instructions.map((i: any) => i.name);
      expect(instructionNames).toContain('initialize_distribution');
      expect(instructionNames).toContain('claim_rewards');
      expect(instructionNames).toContain('distribute_to_vault');
    });
  });

  describe('Instruction Validation', () => {
    test.each(expectedFiles)('%s instructions should have required fields', (filename) => {
      const filePath = path.join(idlDir, filename);
      const idl = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      idl.instructions.forEach((instruction: any) => {
        expect(instruction).toHaveProperty('name');
        expect(instruction).toHaveProperty('accounts');
        expect(instruction).toHaveProperty('args');
        expect(Array.isArray(instruction.accounts)).toBe(true);
        expect(Array.isArray(instruction.args)).toBe(true);
      });
    });
  });
});
