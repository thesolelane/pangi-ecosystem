/** @jest-environment node */

import { PublicKey } from '@solana/web3.js';
import {
  getTaxConfigPDA,
  getDistributionConfigPDA,
  getVaultPDA,
  getHatchlingPDA
} from '@/lib/programs';
import {
  PANGI_TOKEN_PROGRAM_ID,
  PANGI_NFT_PROGRAM_ID,
  PANGI_VAULT_PROGRAM_ID,
  SPECIAL_DISTRIBUTION_PROGRAM_ID
} from '@/lib/constants';

describe('SDK Helper Functions', () => {
  describe('PDA Derivation', () => {
    test('should derive Tax Config PDA', () => {
      const [pda, bump] = getTaxConfigPDA();
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('should derive Distribution Config PDA', () => {
      const [pda, bump] = getDistributionConfigPDA();
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('should derive Vault PDA for NFT mint', () => {
      const nftMint = Keypair.generate().publicKey;
      const [pda, bump] = getVaultPDA(nftMint);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('should derive Hatchling PDA for NFT mint', () => {
      const nftMint = Keypair.generate().publicKey;
      const [pda, bump] = getHatchlingPDA(nftMint);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('should derive consistent PDAs for same inputs', () => {
      const nftMint = Keypair.generate().publicKey;
      
      const [pda1, bump1] = getVaultPDA(nftMint);
      const [pda2, bump2] = getVaultPDA(nftMint);
      
      expect(pda1.toBase58()).toBe(pda2.toBase58());
      expect(bump1).toBe(bump2);
    });

    test('should derive different PDAs for different NFT mints', () => {
      const nftMint1 = Keypair.generate().publicKey;
      const nftMint2 = Keypair.generate().publicKey;
      
      const [pda1] = getVaultPDA(nftMint1);
      const [pda2] = getVaultPDA(nftMint2);
      
      expect(pda1.toBase58()).not.toBe(pda2.toBase58());
    });
  });

  describe('Program ID Constants', () => {
    test('should return consistent program IDs', () => {
      const id1 = PANGI_TOKEN_PROGRAM_ID();
      const id2 = PANGI_TOKEN_PROGRAM_ID();
      
      expect(id1.toBase58()).toBe(id2.toBase58());
    });

    test('all program IDs should be valid PublicKeys', () => {
      expect(PANGI_TOKEN_PROGRAM_ID()).toBeInstanceOf(PublicKey);
      expect(PANGI_NFT_PROGRAM_ID()).toBeInstanceOf(PublicKey);
      expect(PANGI_VAULT_PROGRAM_ID()).toBeInstanceOf(PublicKey);
      expect(SPECIAL_DISTRIBUTION_PROGRAM_ID()).toBeInstanceOf(PublicKey);
    });

    test('all program IDs should be unique', () => {
      const ids = [
        PANGI_TOKEN_PROGRAM_ID().toBase58(),
        PANGI_NFT_PROGRAM_ID().toBase58(),
        PANGI_VAULT_PROGRAM_ID().toBase58(),
        SPECIAL_DISTRIBUTION_PROGRAM_ID().toBase58()
      ];
      
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });
  });
});

// Import Keypair for tests
import { Keypair } from '@solana/web3.js';
