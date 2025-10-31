"use client";

import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getPangiNftProgram, getHatchlingPDA } from "../programs";

/**
 * Initialize a new hatchling NFT
 */
export async function initializeHatchling(
  provider: AnchorProvider,
  nftMint: PublicKey,
  evolutionCooldown: BN
) {
  const program = getPangiNftProgram(provider);
  const [hatchling] = getHatchlingPDA(nftMint);

  return await program.methods
    .initializeHatchling(evolutionCooldown)
    .accounts({
      hatchling,
      nftMint,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/**
 * Evolve a hatchling to the next stage
 */
export async function evolveHatchling(
  provider: AnchorProvider,
  nftMint: PublicKey
) {
  const program = getPangiNftProgram(provider);
  const [hatchling] = getHatchlingPDA(nftMint);

  return await program.methods
    .evolveHatchling()
    .accounts({
      hatchling,
      nftMint,
      authority: provider.wallet.publicKey,
    })
    .rpc();
}

/**
 * Fetch hatchling data
 */
export async function fetchHatchling(
  provider: AnchorProvider,
  nftMint: PublicKey
) {
  const program = getPangiNftProgram(provider);
  const [hatchling] = getHatchlingPDA(nftMint);

  try {
    return await program.account.hatchling.fetch(hatchling);
  } catch (error) {
    console.error("Error fetching hatchling:", error);
    return null;
  }
}

/**
 * Check if hatchling can evolve (cooldown passed)
 */
export async function canEvolve(
  provider: AnchorProvider,
  nftMint: PublicKey
): Promise<boolean> {
  const hatchlingData = await fetchHatchling(provider, nftMint);
  
  if (!hatchlingData) return false;

  const now = Math.floor(Date.now() / 1000);
  const lastEvolution = hatchlingData.lastEvolutionTimestamp.toNumber();
  const cooldown = hatchlingData.evolutionCooldown.toNumber();

  return now >= lastEvolution + cooldown;
}
