"use client";

import { ReactNode, useState } from "react";

interface ScalesTooltipProps {
  children: ReactNode;
  scales: number;
  pangi?: number;
}

export default function ScalesTooltip({ children, scales, pangi }: ScalesTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div 
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            padding: "12px 16px",
            background: "#1A1F26",
            border: "1px solid #9945FF",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            zIndex: 1000,
          }}
        >
          <div style={{ fontSize: "11px", color: "#9AA3AE", marginBottom: "4px" }}>
            ⚖️ Scales (smallest unit)
          </div>
          <div style={{ fontSize: "14px", color: "#E6E8EB", fontWeight: 600, marginBottom: "8px" }}>
            {scales.toLocaleString()} scales
          </div>
          {pangi !== undefined && (
            <div style={{ fontSize: "12px", color: "#9945FF" }}>
              = {pangi.toLocaleString()} PANGI
            </div>
          )}
          <div 
            style={{
              fontSize: "10px",
              color: "#7B3FD1",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #2A313B",
            }}
          >
            1 PANGI = 1 billion scales
          </div>
          
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #9945FF",
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Info icon with scales explanation
 */
export function ScalesInfoIcon() {
  const [show, setShow] = useState(false);

  return (
    <div 
      style={{ position: "relative", display: "inline-block", cursor: "help" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ fontSize: "14px", color: "#9945FF" }}>ⓘ</span>
      
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            padding: "16px",
            background: "#1A1F26",
            border: "1px solid #9945FF",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            width: "280px",
            zIndex: 1000,
          }}
        >
          <div style={{ fontSize: "14px", color: "#E6E8EB", fontWeight: 600, marginBottom: "8px" }}>
            ⚖️ What are scales?
          </div>
          <div style={{ fontSize: "12px", color: "#9AA3AE", lineHeight: 1.5, marginBottom: "12px" }}>
            Scales are the smallest unit of PANGI tokens, named after the protective scales of pangolins.
          </div>
          <div 
            style={{
              padding: "8px",
              background: "rgba(153, 69, 255, 0.1)",
              borderRadius: "6px",
              marginBottom: "8px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#9945FF", fontWeight: 600 }}>
              1 PANGI = 1,000,000,000 scales
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#7B3FD1", lineHeight: 1.4 }}>
            Just like Bitcoin has satoshis, PANGI has scales!
          </div>
          
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #9945FF",
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Scales badge component
 */
export function ScalesBadge({ scales }: { scales: number }) {
  return (
    <ScalesTooltip scales={scales} pangi={scales / 1_000_000_000}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          background: "rgba(153, 69, 255, 0.1)",
          border: "1px solid #9945FF",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#9945FF",
          fontWeight: 600,
          cursor: "help",
        }}
      >
        ⚖️ {formatScalesCompact(scales)}
      </span>
    </ScalesTooltip>
  );
}

function formatScalesCompact(scales: number): string {
  if (scales >= 1_000_000_000_000) {
    return `${(scales / 1_000_000_000_000).toFixed(2)}T`;
  } else if (scales >= 1_000_000_000) {
    return `${(scales / 1_000_000_000).toFixed(2)}B`;
  } else if (scales >= 1_000_000) {
    return `${(scales / 1_000_000).toFixed(2)}M`;
  } else if (scales >= 1_000) {
    return `${(scales / 1_000).toFixed(2)}K`;
  } else {
    return scales.toLocaleString();
  }
}
