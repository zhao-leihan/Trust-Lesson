"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Wallet,
  CheckCircle2,
  Copy,
  LogOut,
  RefreshCw,
  Fuel,
  Coins,
  X,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useWalletBalances } from "../hooks/useWalletBalances";
import { getActiveNetwork } from "../../lib/networkConfig";
import {
  MetaMaskIcon,
  CoinbaseWalletIcon,
  RabbyIcon,
  RainbowIcon,
  WalletConnectIcon,
} from "./WalletIcons";

const WALLET_OPTIONS = [
  {
    id: "metamask",
    name: "MetaMask",
    badge: "Popular",
    desc: "Browser extension & mobile EVM wallet",
    icon: MetaMaskIcon,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    badge: "Passkeys",
    desc: "Biometric passkey or extension",
    icon: CoinbaseWalletIcon,
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    badge: "DeFi Safe",
    desc: "Pre-transaction simulation & anti-phishing",
    icon: RabbyIcon,
  },
  {
    id: "rainbow",
    name: "Rainbow Wallet",
    badge: "Fast EVM",
    desc: "Clean & responsive Ethereum ecosystem wallet",
    icon: RainbowIcon,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    badge: "Universal",
    desc: "Connect 300+ mobile wallets via QR or bridge",
    icon: WalletConnectIcon,
  },
];

export default function WalletConnectCard({ compact = false }) {
  const { walletAddress, connectWallet, disconnectWallet } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState(null);
  const [connectError, setConnectError] = useState("");
  const { usdcBalance, ethBalance, isLoading, refreshBalances } = useWalletBalances(walletAddress);
  const activeNet = getActiveNetwork();

  const handleOpenModal = () => {
    setConnectError("");
    setConnectingWalletId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (connectingWalletId) return;
    setIsModalOpen(false);
    setConnectError("");
  };

  const handleSelectWallet = async (walletId) => {
    setConnectError("");
    setConnectingWalletId(walletId);
    try {
      await connectWallet(walletId);
      setIsModalOpen(false);
    } catch (err) {
      console.warn(`[WalletConnectCard] Connection error with ${walletId}:`, err);
      setConnectError(err.message || "Failed to connect wallet.");
    } finally {
      setConnectingWalletId(null);
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
    const usdcAddr =
      activeNet?.contracts?.usdc ||
      process.env.NEXT_PUBLIC_USDC_ADDRESS ||
      "0x65BfF36b3FD34c58F6543537871D9066CEbA6A44";
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

  return (
    <>
      {compact ? (
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
              onClick={handleOpenModal}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet size={13} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-purple-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm text-slate-950">Arbitrum Escrow Wallet</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {activeNet?.name || "Arbitrum Sepolia"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {walletAddress
                  ? "Connected for non-custodial milestone funding and automated payouts."
                  : "Connect MetaMask, Coinbase, Rabby, Rainbow, or WalletConnect for on-chain escrow."}
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
                onClick={handleOpenModal}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Wallet size={14} />
                <span>Connect Escrow Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5-Wallet Selection Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-10 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Wallet size={18} className="text-purple-600" />
                  <span>Connect Web3 Wallet</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Select your wallet to interact with Arbitrum smart contracts
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={!!connectingWalletId}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error Message */}
            {connectError && (
              <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{connectError}</div>
              </div>
            )}

            {/* 5 Wallet Choices */}
            <div className="p-5 sm:p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {WALLET_OPTIONS.map((wallet) => {
                const IconComponent = wallet.icon;
                const isThisConnecting = connectingWalletId === wallet.id;

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleSelectWallet(wallet.id)}
                    disabled={!!connectingWalletId}
                    className="w-full text-left p-3.5 rounded-2xl border-2 border-slate-200/80 hover:border-purple-500 bg-white hover:bg-purple-50/40 transition-all flex items-center justify-between gap-3 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200/80 flex items-center justify-center p-2 shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {wallet.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {wallet.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {wallet.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400 group-hover:text-purple-600 transition-colors">
                      {isThisConnecting ? (
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Non-custodial & secure</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Arbitrum EVM
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
