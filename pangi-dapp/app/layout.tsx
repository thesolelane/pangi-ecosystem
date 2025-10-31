import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PANGI - Solana Token Ecosystem",
  description: "Dynamic NFT evolution and token distribution on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen`}
      >
        <WalletContextProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
