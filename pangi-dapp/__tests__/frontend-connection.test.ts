/** @jest-environment node */

import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
  getPangiTokenProgram,
  getPangiNftProgram,
  getPangiVaultProgram,
  getSpecialDistributionProgram
} from '@/lib/programs';
import {
  PANGI_TOKEN_PROGRAM_ID,
  PANGI_NFT_PROGRAM_ID,
  PANGI_VAULT_PROGRAM_ID,
  SPECIAL_DISTRIBUTION_PROGRAM_ID,
  RPC_ENDPOINT
} from '@/lib/constants';

// Mock wallet for testing
class MockWallet {
  constructor(public payer: Keypair) {}

  async signTransaction(tx: any) {
    return tx;
  }

  async signAllTransactions(txs: any[]) {
    return txs;
  }

  get publicKey() {
    return this.payer.publicKey;
  }
}

describe('Frontend Program Connection Tests', () => {
  let connection: Connection;
  let provider: AnchorProvider;
  let wallet: MockWallet;

  beforeAll(() => {
    // Create connection to devnet
    connection = new Connection(RPC_ENDPOINT, 'confirmed');
    
    // Create mock wallet
    const payer = Keypair.generate();
    wallet = new MockWallet(payer);
    
    // Create provider
    provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
  });

  describe('Program Initialization', () => {
    test('should initialize Pangi Token program', () => {
      const program = getPangiTokenProgram(provider);
      
      expect(program).toBeDefined();
      expect(program.programId.toBase58()).toBe(PANGI_TOKEN_PROGRAM_ID().toBase58());
      expect(program.idl.name).toBe('pangi_token');
    });

    test('should initialize Pangi NFT program', () => {
      const program = getPangiNftProgram(provider);
      
      expect(program).toBeDefined();
      expect(program.programId.toBase58()).toBe(PANGI_NFT_PROGRAM_ID().toBase58());
      expect(program.idl.name).toBe('pangi_nft');
    });

    test('should initialize Pangi Vault program', () => {
      const program = getPangiVaultProgram(provider);
      
      expect(program).toBeDefined();
      expect(program.programId.toBase58()).toBe(PANGI_VAULT_PROGRAM_ID().toBase58());
      expect(program.idl.name).toBe('pangi_vault');
    });

    test('should initialize Special Distribution program', () => {
      const program = getSpecialDistributionProgram(provider);
      
      expect(program).toBeDefined();
      expect(program.programId.toBase58()).toBe(SPECIAL_DISTRIBUTION_PROGRAM_ID().toBase58());
      expect(program.idl.name).toBe('special_distribution');
    });
  });

  describe('Program IDs', () => {
    test('should have correct Pangi Token program ID', () => {
      const programId = PANGI_TOKEN_PROGRAM_ID();
      expect(programId.toBase58()).toBe('BDSjfUUwEVHxJ3WLxHgNbKddCXEFVX3thS72fg6F4EaA');
    });

    test('should have correct Pangi NFT program ID', () => {
      const programId = PANGI_NFT_PROGRAM_ID();
      expect(programId.toBase58()).toBe('etpBw57TYbPLMiTVB16iRUNKoSvfux2Gi1Mf9omXnYE');
    });

    test('should have correct Pangi Vault program ID', () => {
      const programId = PANGI_VAULT_PROGRAM_ID();
      expect(programId.toBase58()).toBe('5ghkR1LyUMA4K8Dhit2ssqnBbWsZv3sWgvbFSoTKnhw2');
    });

    test('should have correct Special Distribution program ID', () => {
      const programId = SPECIAL_DISTRIBUTION_PROGRAM_ID();
      expect(programId.toBase58()).toBe('bPtCiRVMtoNMxt5r7pyrzRe6YWKB7eJ7fy1LRLMj7Qq');
    });
  });

  describe('IDL Structure', () => {
    test('Pangi Token IDL should have correct structure', () => {
      const program = getPangiTokenProgram(provider);
      
      expect(program.idl.instructions).toHaveLength(2);
      expect(program.idl.instructions[0].name).toBe('transferWithTax');
      expect(program.idl.instructions[1].name).toBe('initializeTaxConfig');
      expect(program.idl.accounts).toHaveLength(1);
    });

    test('Pangi NFT IDL should have correct structure', () => {
      const program = getPangiNftProgram(provider);
      
      expect(program.idl.instructions).toHaveLength(2);
      expect(program.idl.instructions[0].name).toBe('initializeHatchling');
      expect(program.idl.instructions[1].name).toBe('evolveHatchling');
      expect(program.idl.accounts).toHaveLength(1);
    });

    test('Pangi Vault IDL should have correct structure', () => {
      const program = getPangiVaultProgram(provider);
      
      expect(program.idl.instructions).toHaveLength(3);
      expect(program.idl.instructions[0].name).toBe('createVault');
      expect(program.idl.instructions[1].name).toBe('depositTokens');
      expect(program.idl.instructions[2].name).toBe('withdrawTokens');
      expect(program.idl.accounts).toHaveLength(1);
    });

    test('Special Distribution IDL should have correct structure', () => {
      const program = getSpecialDistributionProgram(provider);
      
      expect(program.idl.instructions).toHaveLength(3);
      expect(program.idl.instructions[0].name).toBe('initializeDistribution');
      expect(program.idl.instructions[1].name).toBe('claimRewards');
      expect(program.idl.instructions[2].name).toBe('distributeToVault');
      expect(program.idl.accounts).toHaveLength(1);
    });
  });

  describe('Connection to Devnet', () => {
    test('should connect to Solana devnet', async () => {
      const version = await connection.getVersion();
      expect(version).toBeDefined();
      expect(version['solana-core']).toBeDefined();
    });

    test('should verify programs exist on-chain', async () => {
      const programIds = [
        PANGI_TOKEN_PROGRAM_ID(),
        PANGI_NFT_PROGRAM_ID(),
        PANGI_VAULT_PROGRAM_ID(),
        SPECIAL_DISTRIBUTION_PROGRAM_ID()
      ];

      for (const programId of programIds) {
        const accountInfo = await connection.getAccountInfo(programId);
        expect(accountInfo).not.toBeNull();
        expect(accountInfo?.executable).toBe(true);
      }
    }, 30000); // 30 second timeout for network calls
  });

  describe('Program Methods', () => {
    test('Pangi Token program should have correct methods', () => {
      const program = getPangiTokenProgram(provider);
      
      expect(program.methods.transferWithTax).toBeDefined();
      expect(program.methods.initializeTaxConfig).toBeDefined();
    });

    test('Pangi NFT program should have correct methods', () => {
      const program = getPangiNftProgram(provider);
      
      expect(program.methods.initializeHatchling).toBeDefined();
      expect(program.methods.evolveHatchling).toBeDefined();
    });

    test('Pangi Vault program should have correct methods', () => {
      const program = getPangiVaultProgram(provider);
      
      expect(program.methods.createVault).toBeDefined();
      expect(program.methods.depositTokens).toBeDefined();
      expect(program.methods.withdrawTokens).toBeDefined();
    });

    test('Special Distribution program should have correct methods', () => {
      const program = getSpecialDistributionProgram(provider);
      
      expect(program.methods.initializeDistribution).toBeDefined();
      expect(program.methods.claimRewards).toBeDefined();
      expect(program.methods.distributeToVault).toBeDefined();
    });
  });
});
