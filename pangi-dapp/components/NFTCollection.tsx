"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { getPangiNFTs, hasMatchingPair, NFT } from "@/lib/solana/nfts";
import Image from "next/image";

interface NFTCollectionData {
  pangopups: NFT[];
  adults: NFT[];
  specialEditions: NFT[];
  matchingPairs: Array<{ pangopup: NFT; adult: NFT }>;
  loading: boolean;
}

export default function NFTCollection() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState<NFTCollectionData>({
    pangopups: [],
    adults: [],
    specialEditions: [],
    matchingPairs: [],
    loading: false,
  });
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "pangopups" | "adults" | "pairs">("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setNfts({
        pangopups: [],
        adults: [],
        specialEditions: [],
        matchingPairs: [],
        loading: false,
      });
      return;
    }

    const fetchNFTs = async () => {
      setNfts(prev => ({ ...prev, loading: true }));
      
      try {
        const { pangopups, adults, specialEditions } = await getPangiNFTs(
          connection,
          publicKey
        );

        const matchingPairs = hasMatchingPair(pangopups, adults);

        setNfts({
          pangopups,
          adults,
          specialEditions,
          matchingPairs,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setNfts(prev => ({ ...prev, loading: false }));
      }
    };

    fetchNFTs();
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
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🦎</p>
          <p style={{ color: "#9AA3AE", fontSize: "16px", margin: "0 0 24px" }}>
            Connect wallet to view your NFT collection
          </p>
        </div>
      </div>
    );
  }

  const totalNFTs = nfts.pangopups.length + nfts.adults.length + nfts.specialEditions.length;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Collection Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={cardStyle}>
          <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Total NFTs</p>
          <p style={{ color: "#E6E8EB", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            {totalNFTs}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Pangopups</p>
          <p style={{ color: "#9945FF", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            {nfts.pangopups.length}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Adults</p>
          <p style={{ color: "#14F195", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            {nfts.adults.length}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Matching Pairs</p>
          <p style={{ color: "#FFA500", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            {nfts.matchingPairs.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid #2A313B" }}>
        {[
          { key: "all", label: "All NFTs" },
          { key: "pangopups", label: "Pangopups" },
          { key: "adults", label: "Adults" },
          { key: "pairs", label: "Matching Pairs" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            style={{
              padding: "12px 24px",
              background: "transparent",
              border: "none",
              borderBottom: selectedTab === tab.key ? "2px solid #9945FF" : "2px solid transparent",
              color: selectedTab === tab.key ? "#9945FF" : "#9AA3AE",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NFT Grid */}
      <div>
        {nfts.loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "16px" }}>Loading NFTs...</p>
          </div>
        ) : totalNFTs === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🦎</p>
            <p style={{ color: "#9AA3AE", fontSize: "16px", margin: "0 0 24px" }}>
              You don't own any PANGI NFTs yet
            </p>
            <button
              style={{
                padding: "12px 32px",
                background: "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Mint Pangopup
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {selectedTab === "all" && (
              <>
                {[...nfts.pangopups, ...nfts.adults, ...nfts.specialEditions].map((nft) => (
                  <NFTCard key={nft.mint} nft={nft} />
                ))}
              </>
            )}
            {selectedTab === "pangopups" && (
              <>
                {nfts.pangopups.map((nft) => (
                  <NFTCard key={nft.mint} nft={nft} />
                ))}
              </>
            )}
            {selectedTab === "adults" && (
              <>
                {nfts.adults.map((nft) => (
                  <NFTCard key={nft.mint} nft={nft} />
                ))}
              </>
            )}
            {selectedTab === "pairs" && (
              <>
                {nfts.matchingPairs.map((pair, index) => (
                  <PairCard key={index} pair={pair} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NFTCard({ nft }: { nft: NFT }) {
  const cardStyle = {
    background: "#13161B",
    border: "1px solid #2A313B",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "#9945FF";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#2A313B";
      }}
    >
      {/* Image */}
      <div 
        style={{
          width: "100%",
          paddingTop: "100%",
          background: nft.metadata?.image 
            ? `url(${nft.metadata.image}) center/cover`
            : "linear-gradient(135deg, #2A313B 0%, #1A1F26 100%)",
          position: "relative",
        }}
      >
        {!nft.metadata?.image && (
          <div 
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "48px",
            }}
          >
            🦎
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px" }}>
        <p style={{ color: "#E6E8EB", fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>
          {nft.metadata?.name || "Unknown NFT"}
        </p>
        <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 12px" }}>
          {nft.metadata?.symbol || "???"}
        </p>
        
        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
              <span
                key={index}
                style={{
                  padding: "4px 8px",
                  background: "rgba(153, 69, 255, 0.2)",
                  borderRadius: "4px",
                  color: "#9945FF",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {attr.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PairCard({ pair }: { pair: { pangopup: NFT; adult: NFT } }) {
  const cardStyle = {
    background: "#13161B",
    border: "1px solid #FFA500",
    borderRadius: "12px",
    padding: "20px",
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#E6E8EB", margin: 0 }}>
          Matching Pair
        </h4>
        <span 
          style={{
            padding: "4px 8px",
            background: "rgba(255, 165, 0, 0.2)",
            borderRadius: "4px",
            color: "#FFA500",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          20% BONUS
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 4px" }}>Pangopup</p>
          <p style={{ color: "#9945FF", fontSize: "14px", fontWeight: 600, margin: 0 }}>
            {pair.pangopup.metadata?.name || "Unknown"}
          </p>
        </div>
        <div>
          <p style={{ color: "#9AA3AE", fontSize: "12px", margin: "0 0 4px" }}>Adult</p>
          <p style={{ color: "#14F195", fontSize: "14px", fontWeight: 600, margin: 0 }}>
            {pair.adult.metadata?.name || "Unknown"}
          </p>
        </div>
      </div>

      <button
        style={{
          width: "100%",
          padding: "10px",
          background: "linear-gradient(135deg, #FFA500 0%, #FF6B35 100%)",
          border: "none",
          borderRadius: "8px",
          color: "#FFFFFF",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Stake Pair (30 CATH/day)
      </button>
    </div>
  );
}
