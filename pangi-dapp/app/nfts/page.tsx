"use client";

import { useState, useEffect } from "react";

export default function NFTsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock collection data
  const collectionStats = {
    part1Minted: 523,
    part1Total: 1500,
    part2Minted: 0,
    part2Total: 1500,
    part2Unlocked: false,
    unlockThreshold: 750,
    floorPrice: 0.5,
    volume24h: 125.5,
    holders: 412,
  };

  const unlockProgress = (collectionStats.part1Minted / collectionStats.unlockThreshold) * 100;
  const remainingToUnlock = collectionStats.unlockThreshold - collectionStats.part1Minted;

  // Mock user NFTs
  const userNFTs = [
    { id: 42, type: "pangopup", rarity: "Rare", lineage: "Pure Obsidian", staked: false },
    { id: 156, type: "pangopup", rarity: "Common", lineage: "Azure Hybrid", staked: true },
  ];

  if (!mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "#9AA3AE", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "40px", paddingTop: "40px", paddingBottom: "80px", maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* Hero Section */}
      <section>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 
            style={{
              fontSize: "48px",
              lineHeight: "1.1",
              fontWeight: 800,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #9945FF 0%, #F3F6F9 50%, #C9D1D9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Obsidian Claw Collection
          </h1>
          <p style={{ color: "#9AA3AE", fontSize: "18px", margin: 0 }}>
            3,000 NFTs: 1,500 Pangopups + 1,500 Adults in Matching Pairs
          </p>
        </div>

        {/* Collection Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#13161B", border: "1px solid #2A313B", borderRadius: "12px", padding: "20px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Pangopups Minted</p>
            <p style={{ color: "#14F195", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {collectionStats.part1Minted} / {collectionStats.part1Total}
            </p>
          </div>
          <div style={{ background: "#13161B", border: "1px solid #2A313B", borderRadius: "12px", padding: "20px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Floor Price</p>
            <p style={{ color: "#9945FF", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {collectionStats.floorPrice} SOL
            </p>
          </div>
          <div style={{ background: "#13161B", border: "1px solid #2A313B", borderRadius: "12px", padding: "20px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>24h Volume</p>
            <p style={{ color: "#FFA500", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {collectionStats.volume24h} SOL
            </p>
          </div>
          <div style={{ background: "#13161B", border: "1px solid #2A313B", borderRadius: "12px", padding: "20px" }}>
            <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Holders</p>
            <p style={{ color: "#E6E8EB", fontSize: "24px", fontWeight: 700, margin: 0 }}>
              {collectionStats.holders}
            </p>
          </div>
        </div>

        {/* Unlock Progress */}
        <div 
          style={{
            background: collectionStats.part2Unlocked ? "#13161B" : "linear-gradient(135deg, rgba(153, 69, 255, 0.1) 0%, rgba(20, 241, 149, 0.1) 100%)",
            border: `1px solid ${collectionStats.part2Unlocked ? "#14F195" : "#9945FF"}`,
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "#E6E8EB" }}>
                {collectionStats.part2Unlocked ? "🎉 Adults Unlocked!" : "🔒 Adults Locked"}
              </h3>
              <p style={{ color: "#9AA3AE", fontSize: "14px", margin: 0 }}>
                {collectionStats.part2Unlocked 
                  ? "Part 2 is now available to mint!"
                  : `${remainingToUnlock} more pangopups needed to unlock adults`
                }
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 4px" }}>Progress</p>
              <p style={{ color: "#9945FF", fontSize: "28px", fontWeight: 700, margin: 0 }}>
                {unlockProgress.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div 
            style={{
              width: "100%",
              height: "12px",
              background: "#2A313B",
              borderRadius: "6px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div 
              style={{
                width: `${unlockProgress}%`,
                height: "100%",
                background: collectionStats.part2Unlocked 
                  ? "linear-gradient(90deg, #14F195 0%, #9945FF 100%)"
                  : "linear-gradient(90deg, #9945FF 0%, #FFA500 100%)",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Early Access CTA */}
          {!collectionStats.part2Unlocked && (
            <div 
              style={{
                background: "rgba(153, 69, 255, 0.1)",
                border: "1px solid #9945FF",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h4 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 12px", color: "#E6E8EB" }}>
                🚀 Get Early Access
              </h4>
              <p style={{ color: "#9AA3AE", fontSize: "14px", margin: "0 0 16px", lineHeight: 1.6 }}>
                Don't want to wait? Stake $100 USD worth of PANGI tokens and get your matching adult airdropped instantly!
              </p>
              <button
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(153, 69, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Stake for Early Access
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section>
        <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid #2A313B", marginBottom: "32px" }}>
          {["all", "my-collection", "matching-pairs", "special-editions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: "12px 24px",
                background: "transparent",
                border: "none",
                borderBottom: selectedTab === tab ? "2px solid #9945FF" : "2px solid transparent",
                color: selectedTab === tab ? "#9945FF" : "#9AA3AE",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === "all" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#E6E8EB", margin: 0 }}>
                All NFTs ({collectionStats.part1Minted})
              </h3>
              <div style={{ display: "flex", gap: "12px" }}>
                <select 
                  style={{
                    padding: "8px 16px",
                    background: "#1A1F26",
                    border: "1px solid #2A313B",
                    borderRadius: "8px",
                    color: "#E6E8EB",
                    fontSize: "14px",
                  }}
                >
                  <option>All Rarities</option>
                  <option>Legendary</option>
                  <option>Rare</option>
                  <option>Uncommon</option>
                  <option>Common</option>
                </select>
                <select 
                  style={{
                    padding: "8px 16px",
                    background: "#1A1F26",
                    border: "1px solid #2A313B",
                    borderRadius: "8px",
                    color: "#E6E8EB",
                    fontSize: "14px",
                  }}
                >
                  <option>All Lineages</option>
                  <option>Pure Obsidian</option>
                  <option>Azure Hybrid</option>
                  <option>Crystal Hybrid</option>
                  <option>Cyber Hybrid</option>
                </select>
              </div>
            </div>

            {/* NFT Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "#13161B",
                    border: "1px solid #2A313B",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#9945FF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#2A313B";
                  }}
                >
                  {/* Image Placeholder */}
                  <div 
                    style={{
                      width: "100%",
                      paddingTop: "100%",
                      background: "linear-gradient(135deg, #2A313B 0%, #1A1F26 100%)",
                      position: "relative",
                    }}
                  >
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
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <p style={{ color: "#E6E8EB", fontSize: "16px", fontWeight: 600, margin: 0 }}>
                        Pangopup #{i + 1}
                      </p>
                      <span 
                        style={{
                          padding: "4px 8px",
                          background: "rgba(153, 69, 255, 0.2)",
                          borderRadius: "4px",
                          color: "#9945FF",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        RARE
                      </span>
                    </div>
                    <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 12px" }}>
                      Pure Obsidian Claw
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ color: "#9AA3AE", fontSize: "11px", margin: "0 0 2px" }}>Price</p>
                        <p style={{ color: "#14F195", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                          0.5 SOL
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#9AA3AE", fontSize: "11px", margin: "0 0 2px" }}>Matching Adult</p>
                        <p style={{ color: "#9945FF", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                          #{i + 1501}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === "my-collection" && (
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#E6E8EB", marginBottom: "24px" }}>
              Your Collection ({userNFTs.length})
            </h3>

            {userNFTs.length === 0 ? (
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {userNFTs.map((nft) => (
                  <div
                    key={nft.id}
                    style={{
                      background: "#13161B",
                      border: "1px solid #2A313B",
                      borderRadius: "12px",
                      padding: "24px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                      <div>
                        <p style={{ color: "#E6E8EB", fontSize: "18px", fontWeight: 600, margin: "0 0 4px" }}>
                          Pangopup #{nft.id}
                        </p>
                        <p style={{ color: "#9AA3AE", fontSize: "13px", margin: 0 }}>
                          {nft.lineage}
                        </p>
                      </div>
                      {nft.staked && (
                        <span 
                          style={{
                            padding: "4px 8px",
                            background: "rgba(20, 241, 149, 0.2)",
                            borderRadius: "4px",
                            color: "#14F195",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          STAKED
                        </span>
                      )}
                    </div>

                    <div 
                      style={{
                        background: "rgba(153, 69, 255, 0.1)",
                        border: "1px solid #9945FF",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 8px" }}>Matching Adult</p>
                      <p style={{ color: "#9945FF", fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>
                        Adult #{nft.id + 1500}
                      </p>
                      <p style={{ color: "#9AA3AE", fontSize: "12px", margin: 0 }}>
                        {collectionStats.part2Unlocked 
                          ? "Available to mint now!"
                          : `Unlocks at ${collectionStats.unlockThreshold} pangopups minted`
                        }
                      </p>
                    </div>

                    <button
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: collectionStats.part2Unlocked 
                          ? "linear-gradient(135deg, #14F195 0%, #9945FF 100%)"
                          : "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {collectionStats.part2Unlocked ? "Mint Matching Adult" : "Stake $100 for Early Access"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === "matching-pairs" && (
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#E6E8EB", marginBottom: "16px" }}>
              Matching Pair Finder
            </h3>
            <p style={{ color: "#9AA3AE", fontSize: "14px", marginBottom: "24px" }}>
              Find the matching adult for any pangopup. Each pangopup has a unique matching adult with the same traits.
            </p>

            <div 
              style={{
                background: "#13161B",
                border: "1px solid #2A313B",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <label style={{ display: "block", color: "#9AA3AE", fontSize: "14px", marginBottom: "8px" }}>
                Enter Pangopup ID (1-1500)
              </label>
              <input
                type="number"
                min="1"
                max="1500"
                placeholder="42"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#1A1F26",
                  border: "1px solid #2A313B",
                  borderRadius: "8px",
                  color: "#E6E8EB",
                  fontSize: "16px",
                  marginBottom: "24px",
                }}
              />

              <div 
                style={{
                  background: "rgba(153, 69, 255, 0.1)",
                  border: "1px solid #9945FF",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#9AA3AE", fontSize: "14px", margin: "0 0 8px" }}>Matching Adult</p>
                <p style={{ color: "#9945FF", fontSize: "32px", fontWeight: 700, margin: "0 0 16px" }}>
                  Adult #1542
                </p>
                <p style={{ color: "#9AA3AE", fontSize: "13px", margin: 0 }}>
                  Pangopup #42 ↔ Adult #1542
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "special-editions" && (
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#E6E8EB", marginBottom: "16px" }}>
              Special Editions - 1-of-1 Titled NFTs
            </h3>
            <p style={{ color: "#9AA3AE", fontSize: "14px", marginBottom: "24px" }}>
              Ultra-rare 1-of-1 NFTs with unique titles and enhanced utility. No matching pairs required.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {[
                { title: "Emperor Pangolin", category: "Royal Court", weight: "1000x", multiplier: "5x" },
                { title: "Supreme Chancellor", category: "Galactic Senate", weight: "900x", multiplier: "4.5x" },
                { title: "Grand Master", category: "Jedi Order", weight: "850x", multiplier: "4.5x" },
                { title: "Dark Lord", category: "Sith Empire", weight: "800x", multiplier: "4x" },
              ].map((nft, i) => (
                <div
                  key={i}
                  style={{
                    background: "linear-gradient(135deg, rgba(153, 69, 255, 0.1) 0%, rgba(20, 241, 149, 0.1) 100%)",
                    border: "1px solid #9945FF",
                    borderRadius: "12px",
                    padding: "24px",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <span 
                      style={{
                        padding: "4px 8px",
                        background: "rgba(255, 215, 0, 0.2)",
                        borderRadius: "4px",
                        color: "#FFD700",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      1-OF-1
                    </span>
                  </div>
                  <p style={{ color: "#E6E8EB", fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>
                    {nft.title}
                  </p>
                  <p style={{ color: "#9AA3AE", fontSize: "13px", margin: "0 0 16px" }}>
                    {nft.category}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <p style={{ color: "#9AA3AE", fontSize: "11px", margin: "0 0 4px" }}>Governance</p>
                      <p style={{ color: "#9945FF", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                        {nft.weight}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: "#9AA3AE", fontSize: "11px", margin: "0 0 4px" }}>Staking</p>
                      <p style={{ color: "#14F195", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                        {nft.multiplier}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div 
              style={{
                marginTop: "32px",
                background: "#13161B",
                border: "1px solid #2A313B",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#9AA3AE", fontSize: "14px", margin: "0 0 16px" }}>
                Special Editions are distributed through events, contests, and top staker rewards
              </p>
              <button
                style={{
                  padding: "12px 32px",
                  background: "transparent",
                  border: "1px solid #9945FF",
                  borderRadius: "8px",
                  color: "#9945FF",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Learn More About Titles
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mint CTA */}
      <section style={{ textAlign: "center" }}>
        <div 
          style={{
            background: "linear-gradient(135deg, rgba(153, 69, 255, 0.2) 0%, rgba(20, 241, 149, 0.2) 100%)",
            border: "1px solid #9945FF",
            borderRadius: "16px",
            padding: "48px 32px",
          }}
        >
          <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 16px", color: "#E6E8EB" }}>
            Ready to Join the Clan?
          </h2>
          <p style={{ color: "#9AA3AE", fontSize: "16px", margin: "0 0 32px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Mint your pangopup now and grow it into an adult through community milestones or staking
          </p>
          <button
            style={{
              padding: "16px 48px",
              background: "linear-gradient(135deg, #9945FF 0%, #7B3FD1 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(153, 69, 255, 0.4)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(153, 69, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(153, 69, 255, 0.4)";
            }}
          >
            Mint Pangopup
          </button>
        </div>
      </section>
    </div>
  );
}
