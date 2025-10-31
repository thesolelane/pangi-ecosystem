"use client";

import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { 
  getSpecialDistributionProgram, 
  getDistributionConfigPDA,
  getVaultPDA 
} from "../programs";
import { PANGI_VAULT_PROGRAM_ID } from "../constants";

/**
 * Initialize distribution configuration
 */
export async function initializeDistribution(
  provider: AnchorProvider,
  totalSupply: BN,
  distributionStart: BN,
  distributionEnd: BN
) {
  const program = getSpecialDistributionProgram(provider);
  const [distributionConfig] = getDistributionConfigPDA();

  return await program.methods
    .initializeDistribution(totalSupply, distributionStart, distributionEnd)
    .accounts({
      distributionConfig,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/**
 * Claim rewards from distribution
 */
export async function claimRewards(
  provider: AnchorProvider,
  tokenMint: PublicKey,
  distributionTokenAccount: PublicKey,
  amount: BN
) {
  const program = getSpecialDistributionProgram(provider);
  const [distributionConfig] = getDistributionConfigPDA();

  const recipientTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    provider.wallet.publicKey
  );

  return await program.methods
    .claimRewards(amount)
    .accounts({
      distributionConfig,
      claimant: provider.wallet.publicKey,
      recipientTokenAccount,
      distributionTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/**
 * Distribute tokens to a vault
 */
export async function distributeToVault(
  provider: AnchorProvider,
  nftMint: PublicKey,
  tokenMint: PublicKey,
  distributionTokenAccount: PublicKey,
  amount: BN
) {
  const program = getSpecialDistributionProgram(provider);
  const [distributionConfig] = getDistributionConfigPDA();
  const [vault] = getVaultPDA(nftMint);

  const vaultTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    vault,
    true
  );

  return await program.methods
    .distributeToVault(amount)
    .accounts({
      distributionConfig,
      nftMint,
      vault,
      vaultTokenAccount,
      distributionTokenAccount,
      vaultProgram: PANGI_VAULT_PROGRAM_ID(),
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/**
 * Fetch distribution configuration
 */
export async function fetchDistributionConfig(provider: AnchorProvider) {
  const program = getSpecialDistributionProgram(provider);
  const [distributionConfig] = getDistributionConfigPDA();

  try {
    return await program.account.distributionConfig.fetch(distributionConfig);
  } catch (error) {
    console.error("Error fetching distribution config:", error);
    return null;
  }
}

/**
 * Check if distribution is active
 */
export async function isDistributionActive(
  provider: AnchorProvider
): Promise<boolean> {
  const config = await fetchDistributionConfig(provider);
  
  if (!config) return false;

  const now = Math.floor(Date.now() / 1000);
  const start = config.distributionStart.toNumber();
  const end = config.distributionEnd.toNumber();

  return now >= start && now <= end;
}

/**
 * Get remaining distribution amount
 */
export async function getRemainingDistribution(
  provider: AnchorProvider
): Promise<BN> {
  const config = await fetchDistributionConfig(provider);
  
  if (!config) return new BN(0);

  return config.totalSupply.sub(config.distributedAmount);
}
