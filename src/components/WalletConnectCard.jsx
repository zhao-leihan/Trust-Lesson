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

  const handleAddUsdcToMetaMask = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask is not detected in your browser.");
      return;
    }
    const usdcAddr = activeNet?.contracts?.usdc || process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x65BfF36b3FD34c58F6543537871D9066CEbA6A44";
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: usdcAddr,
            symbol: "USDC",
            decimals: 6,
          },
        },
      });
    } catch (err) {
      console.warn("User rejected watchAsset request:", err);
    }
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
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-purple-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-slate-900">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
          <Wallet size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-sm text-slate-950">
              Arbitrum Escrow Wallet
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {activeNet?.name || "Arbitrum Sepolia"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
              title="Spendable USDC for escrow deposit"
            >
              <Coins size={13} className="text-emerald-600 shrink-0" />
              <span className="text-emerald-700 text-[11px] font-semibold">USDC:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                {isLoading && usdcBalance === null
                  ? "..."
                  : usdcBalance !== null
                  ? usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "0.00"}
              </span>
            </div>

            {/* ETH Gas Fee Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold"
              title="Native ETH for Arbitrum gas fees"
            >
              <Fuel size={13} className="text-purple-600 shrink-0" />
              <span className="text-purple-700 text-[11px] font-semibold">Gas (ETH):</span>
              <span className="font-extrabold text-slate-900 font-mono">
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
              className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
              title="Refresh On-Chain Balances"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin text-purple-600" : ""} />
            </button>

            {/* Import USDC into MetaMask button */}
            <button
              onClick={handleAddUsdcToMetaMask}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Import USDC token directly into MetaMask extension"
            >
              <Coins size={12} className="text-purple-600" />
              <span>Import USDC</span>
            </button>

            {/* Address Pill */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-slate-800 font-bold">{shortAddr}</span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-purple-700 p-0.5 cursor-pointer"
                title="Copy Address"
              >
                {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
              <button
                onClick={disconnectWallet}
                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
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
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Wallet size={14} />
            <span>{isConnecting ? "Connecting..." : "Connect Escrow Wallet"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
