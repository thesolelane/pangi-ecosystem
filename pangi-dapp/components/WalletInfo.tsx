"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function WalletInfo() {
  const { connection } = useConnection();
  const { publicKey, disconnect } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rpcUrl, setRpcUrl] = useState<string>("");
  const [network, setNetwork] = useState<string>("devnet");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("WalletInfo mounted");
  }, []);

  useEffect(() => {
    console.log("WalletInfo - publicKey:", publicKey?.toBase58());
    console.log("WalletInfo - mounted:", mounted);
  }, [publicKey, mounted]);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const openPhantomWallet = () => {
    // This will open the Phantom wallet extension
    if (typeof window !== 'undefined' && (window as any).solana) {
      (window as any).solana.connect({ onlyIfTrusted: false });
    }
  };

  useEffect(() => {
    // Get RPC URL
    setRpcUrl(connection.rpcEndpoint);
  }, [connection]);

  useEffect(() => {
    if (!publicKey) {
      setSolBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);
        console.log("Fetched balance:", balance / LAMPORTS_PER_SOL, "SOL");
        console.log("RPC Endpoint:", connection.rpcEndpoint);
        
        // Detect network from genesis hash
        const genesisHash = await connection.getGenesisHash();
        if (genesisHash === 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG') {
          setNetwork('devnet');
        } else if (genesisHash === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d') {
          setNetwork('mainnet-beta');
        } else {
          setNetwork('localnet');
        }
      } catch (error) {
        console.error("Error fetching SOL balance:", error);
        setSolBalance(0);
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
        <h2 
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "16px",
            background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Wallet Info
        </h2>
        <p style={{ color: "#9AA3AE", textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div style={cardStyle}>
        <h2 
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "16px",
            background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Wallet Info
        </h2>
        <p style={{ color: "#9AA3AE", textAlign: "center", marginBottom: "16px" }}>
          Connect your wallet to see details
        </p>
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
          Wallet Info
        </h2>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            border: "1px solid #2A313B",
            background: "#1A1F26",
            color: "#9AA3AE",
          }}
        >
          DEVNET
        </div>
      </div>
      
      <div style={{ display: "grid", gap: "16px" }}>
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            border: "1px solid #2A313B",
            borderRadius: "12px",
            background: "#1A1F26",
          }}
        >
          <div>
            <p style={{ color: "#9AA3AE", fontSize: "14px", margin: "0 0 4px" }}>Connected</p>
            <p style={{ fontWeight: 600, margin: 0, fontFamily: "monospace", fontSize: "14px" }}>
              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
            </p>
          </div>
          <button
            onClick={copyAddress}
            style={{
              padding: "8px 16px",
              background: copied ? "#1A1F26" : "#9945FF",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div 
            style={{
              padding: "16px",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              background: "#1A1F26",
            }}
          >
            <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 6px" }}>SOL Balance</p>
            {loading ? (
              <p style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#9AA3AE" }}>Loading...</p>
            ) : (
              <p 
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  margin: 0,
                  background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {solBalance !== null ? solBalance.toFixed(4) : "0.0000"}
              </p>
            )}
          </div>

          <div 
            style={{
              padding: "16px",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              background: "#1A1F26",
            }}
          >
            <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 6px" }}>Network</p>
            <p style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#E6E8EB" }}>
              {network || "Devnet"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={openPhantomWallet}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "#1A1F26",
              color: "#E6E8EB",
              border: "1px solid #2A313B",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#9945FF"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2A313B"}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleDisconnect}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "rgba(220, 38, 38, 0.1)",
              color: "#EF4444",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)";
              e.currentTarget.style.borderColor = "#EF4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)";
              e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
            }}
          >
            Disconnect
          </button>
        </div>

        {solBalance === 0 && (
          <div 
            style={{
              padding: "12px",
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              borderRadius: "12px",
            }}
          >
            <p style={{ fontSize: "13px", color: "#FBBF24", fontWeight: 600, margin: "0 0 4px" }}>
              ⚠️ No SOL Balance
            </p>
            <p style={{ fontSize: "12px", color: "#FCD34D", margin: "0 0 8px" }}>
              You need devnet SOL to interact. Get free SOL from:
            </p>
            <a 
              href="https://faucet.solana.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: "12px", color: "#9945FF", textDecoration: "underline" }}
            >
              https://faucet.solana.com/
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
