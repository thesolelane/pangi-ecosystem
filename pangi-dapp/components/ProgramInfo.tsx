"use client";

import { 
  PANGI_TOKEN_PROGRAM_ID, 
  PANGI_VAULT_PROGRAM_ID, 
  PANGI_NFT_PROGRAM_ID, 
  SPECIAL_DISTRIBUTION_PROGRAM_ID,
  NETWORK 
} from "@/lib/constants";
import Image from "next/image";

export default function ProgramInfo() {
  const programs = [
    { name: "Token", id: PANGI_TOKEN_PROGRAM_ID(), logo: "/pangi-token-logo.png" },
    { name: "Vault", id: PANGI_VAULT_PROGRAM_ID(), logo: "/pangi-vault-logo.png" },
    { name: "NFT", id: PANGI_NFT_PROGRAM_ID(), emoji: "🖼️" },
    { name: "Distribution", id: SPECIAL_DISTRIBUTION_PROGRAM_ID(), emoji: "💰" },
  ];

  const cardStyle = {
    background: "#13161B",
    border: "1px solid #2A313B",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(6px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 
          style={{
            fontSize: "20px",
            fontWeight: 700,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <span>⚙️</span>
          Deployed Programs
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
          {NETWORK.toUpperCase()}
        </div>
      </div>
      
      <div style={{ display: "grid", gap: "12px" }}>
        {programs.map((program) => (
          <div 
            key={program.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "#1A1F26",
              border: "1px solid #2A313B",
              borderRadius: "12px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#9945FF";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2A313B";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {program.logo ? (
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #9945FF, #C9D1D9)",
                  }}
                >
                  <Image 
                    src={program.logo} 
                    alt={program.name} 
                    width={20} 
                    height={20}
                    className="rounded"
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #9945FF, #C9D1D9)",
                    fontSize: "18px",
                  }}
                >
                  {program.emoji}
                </div>
              )}
              <span style={{ fontWeight: 600, color: "#E6E8EB" }}>{program.name}</span>
            </div>
            <a
              href={`https://explorer.solana.com/address/${program.id.toBase58()}?cluster=${NETWORK}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "12px",
                color: "#9945FF",
                fontFamily: "monospace",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#C9D1D9"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#9945FF"}
            >
              {program.id.toBase58().slice(0, 8)}...{program.id.toBase58().slice(-4)} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
