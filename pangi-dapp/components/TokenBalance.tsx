"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PANGI_TOKEN_MINT } from "@/lib/constants";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export default function TokenBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const tokenAccount = await getAssociatedTokenAddress(
          PANGI_TOKEN_MINT(),
          publicKey
        );
        
        const accountInfo = await getAccount(connection, tokenAccount);
        setBalance(Number(accountInfo.amount) / 1e9);
      } catch (error) {
        console.log("Token account not found or error:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center">Connect wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-500/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">PANGI Balance</span>
        <span className="text-2xl">🦎</span>
      </div>
      {loading ? (
        <div className="text-2xl font-bold text-gray-400 animate-pulse">Loading...</div>
      ) : (
        <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          {balance !== null ? balance.toLocaleString() : "0"} PANGI
        </div>
      )}
      <div className="mt-2 text-sm text-gray-500">
        Mint: {PANGI_TOKEN_MINT().toBase58().slice(0, 8)}...
      </div>
    </div>
  );
}
