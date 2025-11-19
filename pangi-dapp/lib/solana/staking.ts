/**
 * Staking program interactions for PANGI ecosystem
 */

import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export interface StakeAccount {
  owner: string;
  amount: number;
  lockDuration: number;
  stakedAt: number;
  unlockAt: number;
  apy: number;
  isActive: boolean;
  rewards: number;
}

export interface StakingStats {
  totalStaked: number;
  totalStakers: number;
  totalRewardsPaid: number;
  averageApy: number;
}

/**
 * Get staking program
 */
export function getStakingProgram(
  connection: Connection,
  wallet: WalletContextState,
  programId: PublicKey
): Program | null {
  if (!wallet.publicKey || !wallet.signTransaction) {
    return null;
  }

  const provider = new AnchorProvider(
    connection,
    wallet as any,
    { commitment: 'confirmed' }
  );

  // Load IDL and create program instance
  // This would need the actual IDL
  // For now, return null - implement when IDL is available
  return null;
}

/**
 * Stake PANGI tokens
 */
export async function stakePangi(
  connection: Connection,
  wallet: WalletContextState,
  amount: number,
  lockDuration: number, // in days
  programId: PublicKey,
  tokenMint: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  // Get user's token account
  const userTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  );

  // Derive stake account PDA
  const [stakeAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from("stake"),
      wallet.publicKey.toBuffer(),
      Buffer.from(Date.now().toString()),
    ],
    programId
  );

  // Create transaction
  const transaction = new Transaction();

  // Add stake instruction (would use program.methods.stake())
  // This is a placeholder - actual implementation needs the program IDL
  
  // Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Unstake PANGI tokens
 */
export async function unstakePangi(
  connection: Connection,
  wallet: WalletContextState,
  stakeAccountPubkey: PublicKey,
  programId: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  // Create transaction
  const transaction = new Transaction();

  // Add unstake instruction (would use program.methods.unstake())
  // This is a placeholder - actual implementation needs the program IDL

  // Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Claim staking rewards
 */
export async function claimRewards(
  connection: Connection,
  wallet: WalletContextState,
  stakeAccountPubkey: PublicKey,
  programId: PublicKey,
  rewardMint: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  // Get user's reward token account
  const userRewardAccount = await getAssociatedTokenAddress(
    rewardMint,
    wallet.publicKey
  );

  // Check if account exists, create if not
  const accountInfo = await connection.getAccountInfo(userRewardAccount);
  const transaction = new Transaction();

  if (!accountInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        userRewardAccount,
        wallet.publicKey,
        rewardMint
      )
    );
  }

  // Add claim rewards instruction (would use program.methods.claimRewards())
  // This is a placeholder - actual implementation needs the program IDL

  // Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Stake NFT
 */
export async function stakeNFT(
  connection: Connection,
  wallet: WalletContextState,
  nftMint: PublicKey,
  programId: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  // Get user's NFT token account
  const userNftAccount = await getAssociatedTokenAddress(
    nftMint,
    wallet.publicKey
  );

  // Derive NFT stake account PDA
  const [nftStakeAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from("nft_stake"),
      nftMint.toBuffer(),
      wallet.publicKey.toBuffer(),
    ],
    programId
  );

  // Create transaction
  const transaction = new Transaction();

  // Add stake NFT instruction (would use program.methods.stakeNft())
  // This is a placeholder - actual implementation needs the program IDL

  // Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Unstake NFT
 */
export async function unstakeNFT(
  connection: Connection,
  wallet: WalletContextState,
  nftMint: PublicKey,
  programId: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  // Derive NFT stake account PDA
  const [nftStakeAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from("nft_stake"),
      nftMint.toBuffer(),
      wallet.publicKey.toBuffer(),
    ],
    programId
  );

  // Create transaction
  const transaction = new Transaction();

  // Add unstake NFT instruction (would use program.methods.unstakeNft())
  // This is a placeholder - actual implementation needs the program IDL

  // Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Get user's stake accounts
 */
export async function getUserStakeAccounts(
  connection: Connection,
  userPublicKey: PublicKey,
  programId: PublicKey
): Promise<StakeAccount[]> {
  try {
    // Get all program accounts owned by user
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: userPublicKey.toBase58(),
          },
        },
      ],
    });

    // Parse stake accounts
    // This is a placeholder - actual implementation needs the program IDL
    const stakeAccounts: StakeAccount[] = [];

    return stakeAccounts;
  } catch (error) {
    console.error("Error fetching stake accounts:", error);
    return [];
  }
}

/**
 * Calculate staking rewards
 */
export function calculateStakingRewards(
  amount: number,
  apy: number,
  daysStaked: number
): number {
  const yearlyRewards = (amount * apy) / 100;
  const dailyRewards = yearlyRewards / 365;
  return dailyRewards * daysStaked;
}

/**
 * Calculate early unlock penalty
 */
export function calculateEarlyUnlockPenalty(
  amount: number,
  apy: number,
  daysStaked: number,
  lockDuration: number
): {
  proportionalRewards: number;
  penalty: number;
  userPayout: number;
} {
  const totalPotentialRewards = (amount * apy) / 100;
  const timePercentage = daysStaked / lockDuration;
  const proportionalRewards = totalPotentialRewards * timePercentage;
  const penalty = proportionalRewards * 0.15; // 15% penalty
  const userPayout = proportionalRewards * 0.85; // 85% payout

  return {
    proportionalRewards,
    penalty,
    userPayout,
  };
}

/**
 * Get APY for lock duration
 */
export function getApyForLockDuration(lockDuration: number): number {
  const apyRates: Record<number, number> = {
    30: 30,   // 30 days = 30% APY
    60: 50,   // 60 days = 50% APY
    90: 75,   // 90 days = 75% APY
    180: 100, // 180 days = 100% APY
  };

  return apyRates[lockDuration] || 0;
}

/**
 * Get NFT staking rewards rate
 */
export function getNFTStakingRate(nftType: 'pangopup' | 'adult' | 'pair'): number {
  const rates = {
    pangopup: 10,  // 10 CATH/day
    adult: 15,     // 15 CATH/day
    pair: 30,      // 30 CATH/day (20% bonus)
  };

  return rates[nftType];
}

/**
 * Calculate NFT staking rewards
 */
export function calculateNFTRewards(
  nftType: 'pangopup' | 'adult' | 'pair',
  daysStaked: number
): number {
  const dailyRate = getNFTStakingRate(nftType);
  return dailyRate * daysStaked;
}

/**
 * Get staking statistics
 */
export async function getStakingStats(
  connection: Connection,
  programId: PublicKey
): Promise<StakingStats> {
  try {
    // Fetch staking config account
    // This is a placeholder - actual implementation needs the program IDL
    
    return {
      totalStaked: 0,
      totalStakers: 0,
      totalRewardsPaid: 0,
      averageApy: 0,
    };
  } catch (error) {
    console.error("Error fetching staking stats:", error);
    return {
      totalStaked: 0,
      totalStakers: 0,
      totalRewardsPaid: 0,
      averageApy: 0,
    };
  }
}

/**
 * Unlock adult NFT with CATH payment
 */
export async function unlockAdultNFT(
  connection: Connection,
  wallet: WalletContextState,
  pangopupId: number,
  programId: PublicKey,
  cathMint: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const unlockCost = 10000; // 10,000 CATH

  // Get user's CATH token account
  const userCathAccount = await getAssociatedTokenAddress(
    cathMint,
    wallet.publicKey
  );

  // Create transaction
  const transaction = new Transaction();

  // Add unlock instruction (would use program.methods.unlockAdult())
  // This is a placeholder - actual implementation needs the program IDL
  // The instruction should:
  // 1. Transfer 10,000 CATH from user
  // 2. Burn 5,000 CATH (50%)
  // 3. Send 3,000 CATH to staking rewards (30%)
  // 4. Send 2,000 CATH to treasury (20%)
  // 5. Airdrop matching adult NFT to user

  // Send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}
