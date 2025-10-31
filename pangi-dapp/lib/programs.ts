"use client";

import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { 
  PANGI_TOKEN_PROGRAM_ID,
  PANGI_NFT_PROGRAM_ID,
  PANGI_VAULT_PROGRAM_ID,
  SPECIAL_DISTRIBUTION_PROGRAM_ID,
  RPC_ENDPOINT
} from "./constants";
import { 
  IDL as PangiTokenIDL, 
  PangiToken 
} from "./types/pangi_token";
import { 
  IDL as PangiNftIDL, 
  PangiNft 
} from "./types/pangi_nft";
import { 
  IDL as PangiVaultIDL, 
  PangiVault 
} from "./types/pangi_vault";
import { 
  IDL as SpecialDistributionIDL, 
  SpecialDistribution 
} from "./types/special_distribution";

// Create connection
export const connection = new Connection(RPC_ENDPOINT, "confirmed");

// Program instances (lazy-loaded)
let _pangiTokenProgram: Program<PangiToken> | null = null;
let _pangiNftProgram: Program<PangiNft> | null = null;
let _pangiVaultProgram: Program<PangiVault> | null = null;
let _specialDistributionProgram: Program<SpecialDistribution> | null = null;

/**
 * Get Pangi Token program instance
 */
export function getPangiTokenProgram(provider?: AnchorProvider): Program<PangiToken> {
  if (!_pangiTokenProgram || provider) {
    const programId = PANGI_TOKEN_PROGRAM_ID();
    _pangiTokenProgram = new Program<PangiToken>(
      PangiTokenIDL as PangiToken,
      programId,
      provider
    );
  }
  return _pangiTokenProgram;
}

/**
 * Get Pangi NFT program instance
 */
export function getPangiNftProgram(provider?: AnchorProvider): Program<PangiNft> {
  if (!_pangiNftProgram || provider) {
    const programId = PANGI_NFT_PROGRAM_ID();
    _pangiNftProgram = new Program<PangiNft>(
      PangiNftIDL as PangiNft,
      programId,
      provider
    );
  }
  return _pangiNftProgram;
}

/**
 * Get Pangi Vault program instance
 */
export function getPangiVaultProgram(provider?: AnchorProvider): Program<PangiVault> {
  if (!_pangiVaultProgram || provider) {
    const programId = PANGI_VAULT_PROGRAM_ID();
    _pangiVaultProgram = new Program<PangiVault>(
      PangiVaultIDL as PangiVault,
      programId,
      provider
    );
  }
  return _pangiVaultProgram;
}

/**
 * Get Special Distribution program instance
 */
export function getSpecialDistributionProgram(provider?: AnchorProvider): Program<SpecialDistribution> {
  if (!_specialDistributionProgram || provider) {
    const programId = SPECIAL_DISTRIBUTION_PROGRAM_ID();
    _specialDistributionProgram = new Program<SpecialDistribution>(
      SpecialDistributionIDL as SpecialDistribution,
      programId,
      provider
    );
  }
  return _specialDistributionProgram;
}

/**
 * Helper to derive PDA for tax config
 */
export function getTaxConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("tax_config")],
    PANGI_TOKEN_PROGRAM_ID()
  );
}

/**
 * Helper to derive PDA for distribution config
 */
export function getDistributionConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("distribution_config")],
    SPECIAL_DISTRIBUTION_PROGRAM_ID()
  );
}

/**
 * Helper to derive PDA for vault
 */
export function getVaultPDA(nftMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), nftMint.toBuffer()],
    PANGI_VAULT_PROGRAM_ID()
  );
}

/**
 * Helper to derive PDA for hatchling
 */
export function getHatchlingPDA(nftMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hatchling"), nftMint.toBuffer()],
    PANGI_NFT_PROGRAM_ID()
  );
}
