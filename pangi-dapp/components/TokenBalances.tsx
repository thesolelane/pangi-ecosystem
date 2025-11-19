"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PANGI_TOKEN_MINT, CATH_TOKEN_MINT } from "@/lib/constants";
import { 
  getTokenBalance, 
  getSolBalance, 
  pangiToScales,
  formatScalesCompact 
} from "@/lib/solana/tokens";
import Image from "next/image";

interface TokenBalanceData {
  pangi: number;
  cath: number;
  sol: number;
  loading: boolean;
}

export default function TokenBalances() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balances, setBalances] = useState<TokenBalanceData>({
    pangi: 0,
    cath: 0,
    sol: 0,
    loading: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setBalances({ pangi: 0, cath: 0, sol: 0, loading: false });
      return;
    }

    const fetchBalances = async () => {
      setBalances(prev => ({ ...prev, loading: true }));
      
      try {
        // Fetch PANGI balance
        const pangiBalance = await getTokenBalance(
          connection,
          publicKey,
          PANGI_TOKEN_MINT()
        );

        // Fetch CATH balance
        const cathBalance = await getTokenBalance(
          connection,
          publicKey,
          CATH_TOKEN_MINT()
        );

        // Fetch SOL balance
        const solBalance = await getSolBalance(connection, publicKey);

        setBalances({
          pangi: pangiBalance?.uiAmount || 0,
          cath: cathBalance?.uiAmount || 0,
          sol: solBalance,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
        setBalances(prev => ({ ...prev, loading: false }));
      }
    };

    fetchBalances();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchBalances, 10000);
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
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={cardStyle}>
            <p style={{ color: "#9AA3AE", textAlign: "center" }}>Loading...</p>
          </div>
        ))}
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ color: "#9AA3AE", fontSize: "14px" }}>
            Connect wallet to view balances
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      {/* SOL Balance */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#E6E8EB" }}>
            SOL
          </h3>
          <div
            style={{
              padding: "8px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #14F195, #9945FF)",
            }}
          >
            <span style={{ fontSize: "20px" }}>◎</span>
          </div>
        </div>
        
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          {balances.loading ? (
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#9AA3AE" }}>...</div>
          ) : (
            <>
              <div 
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: "4px",
                  background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {balances.sol.toFixed(4)}
              </div>
              <div style={{ fontSize: "13px", color: "#9AA3AE", fontWeight: 500 }}>
                Solana
              </div>
            </>
          )}
        </div>
      </div>

      {/* PANGI Balance */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#E6E8EB" }}>
            PANGI
          </h3>
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
              width={24} 
              height={24}
              className="rounded"
            />
          </div>
        </div>
        
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          {balances.loading ? (
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#9AA3AE" }}>...</div>
          ) : (
            <>
              <div 
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: "4px",
                  background: "linear-gradient(135deg, #9945FF 0%, #C9D1D9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {balances.pangi.toLocaleString()}
              </div>
              <div style={{ fontSize: "13px", color: "#9AA3AE", fontWeight: 500 }}>
                Governance Token
              </div>
              <div 
                style={{ 
                  fontSize: "11px", 
                  color: "#7B3FD1", 
                  marginTop: "4px",
                  fontWeight: 500 
                }}
                title={`${pangiToScales(balances.pangi).toLocaleString()} scales`}
              >
                ⚖️ {formatScalesCompact(pangiToScales(balances.pangi))}
              </div>
            </>
          )}
        </div>

        <div 
          style={{
            marginTop: "12px",
            padding: "8px",
            background: "#1A1F26",
            border: "1px solid #2A313B",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontSize: "10px", color: "#9AA3AE", margin: "0 0 2px", textTransform: "uppercase" }}>
            Mint
          </p>
          <p style={{ fontSize: "11px", color: "#E6E8EB", margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>
            {PANGI_TOKEN_MINT().toBase58().slice(0, 8)}...{PANGI_TOKEN_MINT().toBase58().slice(-8)}
          </p>
        </div>
      </div>

      {/* CATH Balance */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#E6E8EB" }}>
            CATH
          </h3>
          <div
            style={{
              padding: "8px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FFA500, #FF6B35)",
            }}
          >
            <span style={{ fontSize: "20px" }}>🦎</span>
          </div>
        </div>
        
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          {balances.loading ? (
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#9AA3AE" }}>...</div>
          ) : (
            <>
              <div 
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: "4px",
                  background: "linear-gradient(135deg, #FFA500 0%, #FF6B35 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {balances.cath.toLocaleString()}
              </div>
              <div style={{ fontSize: "13px", color: "#9AA3AE", fontWeight: 500 }}>
                Utility Token
              </div>
              <div 
                style={{ 
                  fontSize: "11px", 
                  color: "#FF8C42", 
                  marginTop: "4px",
                  fontWeight: 500 
                }}
                title={`${pangiToScales(balances.cath).toLocaleString()} scales`}
              >
                ⚖️ {formatScalesCompact(pangiToScales(balances.cath))}
              </div>
            </>
          )}
        </div>

        <div 
          style={{
            marginTop: "12px",
            padding: "8px",
            background: "#1A1F26",
            border: "1px solid #2A313B",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontSize: "10px", color: "#9AA3AE", margin: "0 0 2px", textTransform: "uppercase" }}>
            Mint
          </p>
          <p style={{ fontSize: "11px", color: "#E6E8EB", margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>
            {CATH_TOKEN_MINT().toBase58().slice(0, 8)}...{CATH_TOKEN_MINT().toBase58().slice(-8)}
          </p>
        </div>
      </div>
    </div>
  );
}
