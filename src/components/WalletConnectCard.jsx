import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Wallet, CheckCircle2, Copy, LogOut, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function WalletConnectCard({ compact = false }) {
  const { walletAddress, connectWallet, disconnectWallet } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } finally {
      setTimeout(() => setIsConnecting(false), 300);
    }
  };

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {walletAddress ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{shortAddr}</span>
            <button
              onClick={handleCopy}
              className="text-purple-500 hover:text-purple-700 ml-1"
              title="Copy Address"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
            <button
              onClick={disconnectWallet}
              className="text-slate-400 hover:text-rose-600 ml-1"
              title="Disconnect Wallet"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Wallet size={13} />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-indigo-400">
          <Wallet size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">
              Arbitrum Escrow Wallet
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
              Arbitrum One
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {walletAddress
              ? "Connected for non-custodial milestone funding and automated payouts."
              : "Connect MetaMask or Web3 wallet to interact with on-chain milestone escrow."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {walletAddress ? (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-slate-200 font-semibold">{shortAddr}</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              title="Copy Address"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            <button
              onClick={disconnectWallet}
              className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
              title="Disconnect Wallet"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Wallet size={14} />
            <span>{isConnecting ? "Connecting..." : "Connect Escrow Wallet"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
