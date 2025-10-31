"use client";

import { 
  PANGI_TOKEN_PROGRAM_ID, 
  PANGI_VAULT_PROGRAM_ID, 
  PANGI_NFT_PROGRAM_ID, 
  SPECIAL_DISTRIBUTION_PROGRAM_ID,
  NETWORK 
} from "@/lib/constants";

export default function ProgramInfo() {
  const programs = [
    { name: "Token", id: PANGI_TOKEN_PROGRAM_ID(), emoji: "🪙" },
    { name: "Vault", id: PANGI_VAULT_PROGRAM_ID(), emoji: "🏦" },
    { name: "NFT", id: PANGI_NFT_PROGRAM_ID(), emoji: "🖼️" },
    { name: "Distribution", id: SPECIAL_DISTRIBUTION_PROGRAM_ID(), emoji: "💰" },
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>⚙️</span>
        Deployed Programs ({NETWORK})
      </h2>
      <div className="space-y-3">
        {programs.map((program) => (
          <div key={program.name} className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">{program.emoji}</span>
              <span className="font-medium">{program.name}</span>
            </div>
            <a
              href={`https://explorer.solana.com/address/${program.id.toBase58()}?cluster=${NETWORK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 font-mono"
            >
              {program.id.toBase58().slice(0, 8)}...
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
