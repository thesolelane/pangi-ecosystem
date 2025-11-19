"use client";

import { useState, useEffect } from "react";
import TokenBalance from "@/components/TokenBalance";
import ProgramInfo from "@/components/ProgramInfo";
import WalletInfo from "@/components/WalletInfo";
import Image from "next/image";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "#9AA3AE", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "80px", paddingTop: "40px", paddingBottom: "80px" }}>
      {/* Hero Section */}
      <section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px", alignItems: "center" }}>
          <div style={{ display: "grid", gap: "20px", textAlign: "center" }}>
            <div 
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid #2A313B",
                background: "#1A1F26",
                color: "#9AA3AE",
                width: "fit-content",
                margin: "0 auto",
              }}
            >
              <span style={{ color: "#9945FF" }}>●</span> Live on Solana Devnet
            </div>
            <h1 
              style={{
                fontSize: "56px",
                lineHeight: "1.1",
                fontWeight: 800,
                margin: 0,
                background: "linear-gradient(135deg, #9945FF 0%, #F3F6F9 50%, #C9D1D9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Matching Pair NFTs with on-chain utility
            </h1>
            <p style={{ color: "#9AA3AE", fontSize: "18px", margin: 0, maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
              Collect pangopups, grow them into adults through staking or community milestones. A DeFi-native collection with real utility built for Solana.
            </p>
          </div>

          {/* Featured NFT Circle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "360px",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                border: "1px solid #2A313B",
                background: "linear-gradient(135deg, #F3F6F9, #C9D1D9)",
                padding: "16px",
                boxShadow: "0 0 0 2px rgba(153,69,255,0.3) inset, 0 8px 24px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#13161B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Image 
                  src="/pangi-token-logo.png" 
                  alt="PANGI NFT" 
                  width={120} 
                  height={120}
                  className="rounded-2xl"
                />
                <div>
                  <p style={{ color: "#9AA3AE", fontSize: "14px", margin: 0 }}>Life Stage</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, margin: "4px 0", color: "#E6E8EB" }}>Pangopup</p>
                  <p style={{ color: "#9945FF", fontSize: "13px", margin: 0, fontWeight: 600 }}>Soft scales, riding mother's tail</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "24px",
            textAlign: "center",
            background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Core Features
        </h2>
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {[
            { icon: "💎", title: "Dynamic Tax System", body: "Route a % of transfers to the Conservation Fund." },
            { icon: "🖼️", title: "Matching Pair NFTs", body: "1,500 pairs: Pangopups available now, Adults unlock at 50% mint or $100 stake." },
            { icon: "🔒", title: "Grow Your Pup", body: "Stake $100 USD worth of PANGI → Adult airdropped instantly!" },
            { icon: "💰", title: "Special Titles", body: "1-of-1 NFTs: King, Queen, Chancellor, General - Ultra-rare editions." },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                background: "#13161B",
                border: "1px solid #2A313B",
                borderRadius: "16px",
                padding: "24px",
                backdropFilter: "blur(6px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9945FF";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2A313B";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{feature.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px", color: "#E6E8EB" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#9AA3AE", margin: 0, lineHeight: 1.6 }}>
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Wallet & Balance */}
      <section style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <WalletInfo />
        <TokenBalance />
      </section>

      {/* Program Info */}
      <section>
        <ProgramInfo />
      </section>
    </div>
  );
}
