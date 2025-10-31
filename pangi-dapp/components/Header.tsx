"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🦎</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              PANGI
            </h1>
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-green-500 !to-blue-600 hover:!from-green-600 hover:!to-blue-700" />
        </div>
      </div>
    </header>
  );
}
