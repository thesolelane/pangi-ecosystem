/**
 * SPL Token utilities for fetching balances and interacting with tokens
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  getAccount,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from "@solana/spl-token";

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  tokenAccount: string;
}

/**
 * Get SPL token balance for a specific mint
 */
export async function getTokenBalance(
  connection: Connection,
  walletPublicKey: PublicKey,
  mintPublicKey: PublicKey
): Promise<TokenBalance | null> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey
    );

    const accountInfo = await getAccount(connection, tokenAccount);

    return {
      mint: mintPublicKey.toBase58(),
      amount: Number(accountInfo.amount),
      decimals: 9, // Standard for most Solana tokens
      uiAmount: Number(accountInfo.amount) / 1e9,
      tokenAccount: tokenAccount.toBase58(),
    };
  } catch (error) {
    console.log(`Token account not found for mint ${mintPublicKey.toBase58()}:`, error);
    return null;
  }
}

/**
 * Get all SPL token balances for a wallet
 */
export async function getAllTokenBalances(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<TokenBalance[]> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map((accountInfo) => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      return {
        mint: parsedInfo.mint,
        amount: parsedInfo.tokenAmount.amount,
        decimals: parsedInfo.tokenAmount.decimals,
        uiAmount: parsedInfo.tokenAmount.uiAmount,
        tokenAccount: accountInfo.pubkey.toBase58(),
      };
    });
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return [];
  }
}

/**
 * Get SOL balance
 */
export async function getSolBalance(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getBalance(walletPublicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    return 0;
  }
}

/**
 * Check if token account exists
 */
export async function tokenAccountExists(
  connection: Connection,
  walletPublicKey: PublicKey,
  mintPublicKey: PublicKey
): Promise<boolean> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey
    );
    
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    return accountInfo !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get token metadata (name, symbol, etc.)
 */
export interface TokenMetadata {
  mint: string;
  name?: string;
  symbol?: string;
  decimals: number;
  supply?: number;
}

export async function getTokenMetadata(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<TokenMetadata | null> {
  try {
    const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
    
    if (!mintInfo.value) {
      return null;
    }

    const data = mintInfo.value.data;
    if ('parsed' in data) {
      const parsedData = data.parsed;
      return {
        mint: mintPublicKey.toBase58(),
        decimals: parsedData.info.decimals,
        supply: parsedData.info.supply,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(amount: number, decimals: number = 9): string {
  const value = amount / Math.pow(10, decimals);
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  } else if (value >= 1) {
    return value.toFixed(2);
  } else {
    return value.toFixed(4);
  }
}

/**
 * Parse token amount to raw value
 */
export function parseTokenAmount(amount: string, decimals: number = 9): number {
  const value = parseFloat(amount);
  return Math.floor(value * Math.pow(10, decimals));
}
