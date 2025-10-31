import TokenBalance from "@/components/TokenBalance";
import ProgramInfo from "@/components/ProgramInfo";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">
          <span className="text-6xl">🦎</span>
          <br />
          Welcome to PANGI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Dynamic NFT evolution and token distribution ecosystem on Solana
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TokenBalance />
        <ProgramInfo />
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-2xl mb-2">🪙</div>
            <h3 className="font-bold mb-1">Dynamic Tax System</h3>
            <p className="text-sm text-gray-400">
              Configurable taxes on transfers with conservation fund
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="font-bold mb-1">NFT Evolution</h3>
            <p className="text-sm text-gray-400">
              5-tier evolution system from Egg to Legendary
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-2xl mb-2">🏦</div>
            <h3 className="font-bold mb-1">Staking Vaults</h3>
            <p className="text-sm text-gray-400">
              Stake NFTs to earn rewards and evolution points
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-bold mb-1">Special Distribution</h3>
            <p className="text-sm text-gray-400">
              63M PANGI distributed across 25 special NFTs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
