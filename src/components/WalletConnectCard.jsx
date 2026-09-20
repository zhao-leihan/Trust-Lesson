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
    <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-950/20">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300 shadow-inner">
            <Wallet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">
                Web3 Escrow Wallet
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Arbitrum One
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1 max-w-lg leading-relaxed">
              {walletAddress
                ? "Your wallet is linked to the Trust lesson smart escrow contracts for instant milestone payouts and secure funds release."
                : "Connect your Web3 wallet to fund learning milestones or receive automated payouts directly to your wallet."}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {walletAddress ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-2 px-4 border border-white/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-white tracking-wide">
                  {shortAddr}
                </span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <button
                onClick={handleCopy}
                className="text-purple-200 hover:text-white transition-colors p-1"
                title="Copy Address"
              >
                {copied ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : (
                  <Copy size={15} />
                )}
              </button>
              <button
                onClick={disconnectWallet}
                className="text-rose-300 hover:text-rose-100 transition-colors p-1"
                title="Disconnect"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Wallet size={16} />
              <span>{isConnecting ? "Connecting Web3..." : "Connect Escrow Wallet"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
