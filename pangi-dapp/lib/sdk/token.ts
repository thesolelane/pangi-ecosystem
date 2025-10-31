"use client";

import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getPangiTokenProgram, getTaxConfigPDA } from "../programs";

/**
 * Transfer tokens with tax
 */
export async function transferWithTax(
  provider: AnchorProvider,
  from: PublicKey,
  to: PublicKey,
  conservationFund: PublicKey,
  amount: BN
) {
  const program = getPangiTokenProgram(provider);
  const [taxConfig] = getTaxConfigPDA();

  return await program.methods
    .transferWithTax(amount)
    .accounts({
      from,
      to,
      conservationFund,
      authority: provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      taxConfig,
    })
    .rpc();
}

/**
 * Initialize tax configuration
 */
export async function initializeTaxConfig(
  provider: AnchorProvider,
  conservationFund: PublicKey,
  p2pTaxRate: number,
  exchangeTaxRate: number,
  whaleTaxRate: number,
  whaleThreshold: BN
) {
  const program = getPangiTokenProgram(provider);
  const [taxConfig] = getTaxConfigPDA();

  return await program.methods
    .initializeTaxConfig(
      p2pTaxRate,
      exchangeTaxRate,
      whaleTaxRate,
      whaleThreshold
    )
    .accounts({
      taxConfig,
      conservationFund,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/**
 * Fetch tax configuration
 */
export async function fetchTaxConfig(provider: AnchorProvider) {
  const program = getPangiTokenProgram(provider);
  const [taxConfig] = getTaxConfigPDA();

  try {
    return await program.account.taxConfig.fetch(taxConfig);
  } catch (error) {
    console.error("Error fetching tax config:", error);
    return null;
  }
}
