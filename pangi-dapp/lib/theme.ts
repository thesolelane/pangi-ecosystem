// Design tokens extracted from canvas preview
export const theme = {
  colors: {
    bg: "#0B0D10",
    surface: "#13161B",
    surface2: "#1A1F26",
    border: "#2A313B",
    text: "#E6E8EB",
    muted: "#9AA3AE",
    purple: "#9945FF", // Solana purple
    silverHi: "#F3F6F9",
    silverLo: "#C9D1D9",
  },
  shadows: {
    card: "0 6px 20px rgba(0,0,0,0.35)",
    glow: "0 0 0 2px rgba(153,69,255,0.3) inset",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    full: "9999px",
  },
} as const;
