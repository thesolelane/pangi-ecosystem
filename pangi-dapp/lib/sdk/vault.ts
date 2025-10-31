"use client";

import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { getPangiVaultProgram, getVaultPDA } from "../programs";

/**
 * Create a new vault for an NFT
 */
export async function createVault(
  provider: AnchorProvider,
  nftMint: PublicKey
) {
  const program = getPangiVaultProgram(provider);
  const [vault] = getVaultPDA(nftMint);

  return await program.methods
    .createVault()
    .accounts({
      vault,
      nftMint,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/**
 * Deposit tokens into a vault
 */
export async function depositTokens(
  provider: AnchorProvider,
  nftMint: PublicKey,
  tokenMint: PublicKey,
  amount: BN
) {
  const program = getPangiVaultProgram(provider);
  const [vault] = getVaultPDA(nftMint);

  const userTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    provider.wallet.publicKey
  );

  const vaultTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    vault,
    true
  );

  return await program.methods
    .depositTokens(amount)
    .accounts({
      vault,
      nftMint,
      userTokenAccount,
      vaultTokenAccount,
      tokenMint,
      authority: provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/**
 * Withdraw tokens from a vault
 */
export async function withdrawTokens(
  provider: AnchorProvider,
  nftMint: PublicKey,
  tokenMint: PublicKey,
  amount: BN
) {
  const program = getPangiVaultProgram(provider);
  const [vault] = getVaultPDA(nftMint);

  const userTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    provider.wallet.publicKey
  );

  const vaultTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    vault,
    true
  );

  return await program.methods
    .withdrawTokens(amount)
    .accounts({
      vault,
      nftMint,
      vaultTokenAccount,
      userTokenAccount,
      tokenMint,
      authority: provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/**
 * Fetch vault data
 */
export async function fetchVault(
  provider: AnchorProvider,
  nftMint: PublicKey
) {
  const program = getPangiVaultProgram(provider);
  const [vault] = getVaultPDA(nftMint);

  try {
    return await program.account.vault.fetch(vault);
  } catch (error) {
    console.error("Error fetching vault:", error);
    return null;
  }
}

/**
 * Get vault token balance
 */
export async function getVaultTokenBalance(
  provider: AnchorProvider,
  nftMint: PublicKey,
  tokenMint: PublicKey
): Promise<BN> {
  const [vault] = getVaultPDA(nftMint);
  
  const vaultTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    vault,
    true
  );

  try {
    const accountInfo = await provider.connection.getTokenAccountBalance(
      vaultTokenAccount
    );
    return new BN(accountInfo.value.amount);
  } catch (error) {
    console.error("Error fetching vault balance:", error);
    return new BN(0);
  }
}
