import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Wallet, CheckCircle2, Copy, LogOut, RefreshCw, Fuel, Coins } from "lucide-react";
import { useWalletBalances } from "../hooks/useWalletBalances";
import { getActiveNetwork } from "../../lib/networkConfig";

export default function WalletConnectCard({ compact = false }) {
  const { walletAddress, connectWallet, disconnectWallet } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { usdcBalance, ethBalance, isLoading, refreshBalances } = useWalletBalances(walletAddress);
  const activeNet = getActiveNetwork();

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
            {usdcBalance !== null && (
              <span className="text-[11px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md font-bold">
                {usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })} USDC
              </span>
            )}
            <button
              onClick={handleCopy}
              className="text-purple-500 hover:text-purple-700 ml-1 cursor-pointer"
              title="Copy Address"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
            <button
              onClick={disconnectWallet}
              className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
              title="Disconnect Wallet"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet size={13} />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-indigo-400">
          <Wallet size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-white">
              Arbitrum Escrow Wallet
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
              {activeNet?.name || "Arbitrum Sepolia"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {walletAddress
              ? "Connected for non-custodial milestone funding and automated payouts."
              : "Connect MetaMask or Web3 wallet to interact with on-chain milestone escrow."}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
        {walletAddress ? (
          <>
            {/* USDC Balance Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
              title="Spendable USDC for escrow deposit"
            >
              <Coins size={13} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300 text-[11px] font-semibold">USDC:</span>
              <span className="font-bold text-white font-mono">
                {isLoading && usdcBalance === null
                  ? "..."
                  : usdcBalance !== null
                  ? usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "0.00"}
              </span>
            </div>

            {/* ETH Gas Fee Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium"
              title="Native ETH for Arbitrum gas fees"
            >
              <Fuel size={13} className="text-sky-400 shrink-0" />
              <span className="text-slate-300 text-[11px] font-semibold">Gas (ETH):</span>
              <span className="font-bold text-white font-mono">
                {isLoading && ethBalance === null
                  ? "..."
                  : ethBalance !== null
                  ? `${ethBalance.toFixed(4)}`
                  : "0.0000"}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshBalances}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh On-Chain Balances"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin text-purple-400" : ""} />
            </button>

            {/* Address Pill */}
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
          </>
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
