"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/transfer", label: "Transfer" },
    { href: "/nfts", label: "NFTs" },
    { href: "/stake", label: "Stake" },
    { href: "/evolve", label: "Evolve" },
  ];

  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(11, 13, 16, 0.8)",
        borderBottom: "1px solid #2A313B",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div 
              className="relative"
              style={{
                padding: "2px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #9945FF, #C9D1D9)",
              }}
            >
              <div style={{ background: "#13161B", borderRadius: "10px", padding: "2px" }}>
                <Image 
                  src="/pangi-token-logo.png" 
                  alt="PANGI Logo" 
                  width={36} 
                  height={36}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{
                  background: "linear-gradient(90deg, #9945FF 0%, #C9D1D9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                PANGI
              </h1>
              <p className="text-xs" style={{ color: "#9AA3AE" }}>Evolution Protocol</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: isActive ? "#E6E8EB" : "#9AA3AE",
                    background: isActive ? "#9945FF20" : "transparent",
                    border: isActive ? "1px solid #9945FF" : "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#1A1F26";
                      e.currentTarget.style.color = "#E6E8EB";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9AA3AE";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Button */}
          {mounted ? (
            <WalletMultiButton 
              style={{
                background: "#9945FF",
                borderRadius: "12px",
                height: "44px",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            />
          ) : (
            <div 
              className="animate-pulse"
              style={{
                height: "44px",
                width: "140px",
                background: "#1A1F26",
                borderRadius: "12px",
                border: "1px solid #2A313B",
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
