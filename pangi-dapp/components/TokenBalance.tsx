"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PANGI_TOKEN_MINT } from "@/lib/constants";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Image from "next/image";

export default function TokenBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const cardStyle = {
    background: "#13161B",
    border: "1px solid #2A313B",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(6px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
  };

  if (!mounted) {
    return (
      <div style={cardStyle}>
        <p style={{ color: "#9AA3AE", textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Image 
            src="/pangi-token-logo.png" 
            alt="PANGI" 
            width={64} 
            height={64}
            className="rounded-lg"
            style={{ margin: "0 auto 16px" }}
          />
          <p style={{ color: "#9AA3AE", fontSize: "14px" }}>Connect wallet to view balance</p>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 
          style={{
            fontSize: "20px",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          PANGI Balance
        </h2>
        <div
          style={{
            padding: "8px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #9945FF, #C9D1D9)",
          }}
        >
          <Image 
            src="/pangi-token-logo.png" 
            alt="PANGI" 
            width={32} 
            height={32}
            className="rounded"
          />
        </div>
      </div>
      
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        {loading ? (
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#9AA3AE" }}>Loading...</div>
        ) : (
          <>
            <div 
              style={{
                fontSize: "48px",
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: "8px",
                background: "linear-gradient(135deg, #9945FF 0%, #F3F6F9 50%, #C9D1D9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {balance !== null ? balance.toLocaleString() : "0"}
            </div>
            <div style={{ fontSize: "16px", color: "#9AA3AE", fontWeight: 600 }}>
              PANGI
            </div>
          </>
        )}
      </div>

      <div 
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "#1A1F26",
          border: "1px solid #2A313B",
          borderRadius: "10px",
        }}
      >
        <p style={{ fontSize: "11px", color: "#9AA3AE", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Token Mint
        </p>
        <p style={{ fontSize: "13px", color: "#E6E8EB", margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>
          {PANGI_TOKEN_MINT().toBase58().slice(0, 12)}...{PANGI_TOKEN_MINT().toBase58().slice(-12)}
        </p>
      </div>
    </div>
  );
}
