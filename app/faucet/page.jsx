"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../../src/components/Footer";
import {
  Droplets,
  Coins,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Wallet,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";

export default function FaucetPage() {
  const [faucetInfo, setFaucetInfo] = useState({
    faucetAddress: "0xf2cE5319aeB733fd2279a830260316358A036098",
    tokenAddress: "0x65BfF36b3FD34c58F6543537871D9066CEbA6A44",
    tokenSymbol: "USDC",
    network: "Arbitrum Sepolia",
    chainId: 421614,
    faucetBalance: "1,000,000",
    defaultDripAmount: 250,
  });

  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [isLoading, setIsLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [tokenAddedSuccess, setTokenAddedSuccess] = useState(false);

  useEffect(() => {
    fetchFaucetInfo();
  }, []);

  const fetchFaucetInfo = async () => {
    try {
      const res = await fetch("/api/faucet/info");
      if (res.ok) {
        const data = await res.json();
        setFaucetInfo((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn("Failed to fetch live faucet info:", err);
    }
  };

  const handleUseConnectedWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setRecipientAddress(accounts[0]);
        }
      } catch (err) {
        setClaimError("Failed to connect wallet: " + err.message);
      }
    } else {
      setClaimError("No Web3 wallet detected in browser. Please enter your address manually.");
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    setClaimError("");
    setClaimSuccess(null);

    const targetAddr = recipientAddress.trim();
    if (!targetAddr || !/^0x[a-fA-F0-9]{40}$/.test(targetAddr)) {
      setClaimError("Please enter a valid Arbitrum Sepolia wallet address (0x...).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/faucet/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientAddress: targetAddr,
          amount: selectedAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Faucet claim failed.");
      }

      setClaimSuccess(data);
      fetchFaucetInfo();
    } catch (err) {
      setClaimError(err.message || "Failed to process faucet claim.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text, type) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "faucet") {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2500);
      } else if (type === "token") {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2500);
      }
    }
  };

  const handleAddToMetaMask = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsAddingToken(true);
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: faucetInfo.tokenAddress,
              symbol: "USDC",
              decimals: 6,
              image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
            },
          },
        });
        setTokenAddedSuccess(true);
        setTimeout(() => setTokenAddedSuccess(false), 4000);
      } catch (err) {
        console.warn("User rejected adding token:", err.message);
      } finally {
        setIsAddingToken(false);
      }
    } else {
      alert("MetaMask or Web3 wallet not detected in your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Header & Badges */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
            <Droplets size={14} className="text-purple-600" />
            <span>Testnet Faucet Pool</span>
            <span>•</span>
            <span className="text-purple-600 font-mono">Arbitrum Sepolia (421614)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Claim Mock USDC Testnet Tokens
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Get free testnet USDC tokens on Arbitrum Sepolia to test escrow payments, mentor booking, collateral staking, and course purchases on Trust Lesson.
          </p>
        </div>

        {/* Prominent Tester Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3.5 shadow-xs">
          <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-900 text-sm">
              Demonstration & Testing Purpose Only
            </h4>
            <p className="text-amber-800 leading-relaxed text-xs">
              This faucet dispenses <strong>Mock USDC</strong> on the <strong>Arbitrum Sepolia Testnet</strong>. These tokens hold zero monetary or real-world value and exist exclusively for platform feature verification, user testing, and demonstration workflows.
            </p>
          </div>
        </div>

        {/* Main Grid: Claim Form & Faucet Vault Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Interactive Claim Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                  <Coins size={18} className="text-purple-600" />
                  <span>Request Test Tokens</span>
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Enter your recipient address to receive instant testnet USDC.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Dispenser
              </span>
            </div>

            {/* Success Alert */}
            {claimSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{claimSuccess.message || "Tokens successfully transferred!"}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <span className="font-mono text-emerald-700 truncate max-w-xs">
                    Tx: {claimSuccess.txHash}
                  </span>
                  {claimSuccess.explorerUrl && (
                    <a
                      href={claimSuccess.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                    >
                      <span>View on Arbiscan</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Error Alert */}
            {claimError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            <form onSubmit={handleClaim} className="space-y-5">
              {/* Recipient Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Recipient EVM Address
                  </label>
                  <button
                    type="button"
                    onClick={handleUseConnectedWallet}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Wallet size={13} />
                    <span>Use Connected Wallet</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-mono text-xs bg-slate-50 focus:bg-white transition-all text-slate-900 outline-none"
                />
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Select Claim Amount
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-3 px-4 rounded-2xl font-black text-xs transition-all border cursor-pointer ${
                        selectedAmount === amt
                          ? "bg-purple-600 border-purple-600 text-white shadow-sm ring-2 ring-purple-200"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-200"
                      }`}
                    >
                      {amt} USDC
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Recommended for testing: 250 USDC (enough for 2-3 mentor bookings or 100 USDC mentor staking).
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Sending Arbitrum Sepolia Tx...</span>
                  </>
                ) : (
                  <>
                    <Droplets size={14} />
                    <span>Claim {selectedAmount} Testnet USDC</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Column 2: Faucet Pool Vault & Contract Reference (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Faucet Treasury Vault Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-7 border border-purple-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-[10px] font-extrabold tracking-widest uppercase">
                  Faucet Pool Vault
                </span>
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Funded</span>
                </span>
              </div>

              <div>
                <p className="text-purple-200/80 text-xs font-semibold">Available Vault Pool</p>
                <p className="text-2xl sm:text-3xl font-black mt-0.5 tracking-tight">
                  {faucetInfo.faucetBalance ? Number(faucetInfo.faucetBalance).toLocaleString() : "1,000,000"} USDC
                </p>
                <p className="text-[11px] text-purple-300 mt-1">
                  Transfers are settled directly on Arbitrum Sepolia L2 with zero gas fees charged to the claimant.
                </p>
              </div>

              {/* Faucet Address Box (For User Deposit) */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-purple-200 uppercase tracking-wider">
                    Faucet Relayer Address
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(faucetInfo.faucetAddress, "faucet")}
                    className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold transition-colors"
                  >
                    {copiedAddress ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-purple-100 break-all select-all">
                  {faucetInfo.faucetAddress}
                </div>
                <p className="text-[10px] text-purple-300/80 leading-relaxed">
                  To replenish the public tester pool, transfer your mock USDC directly from MetaMask to this vault address.
                </p>
              </div>
            </div>

            {/* Token Contract Reference Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-600" />
                <span>Mock Token Information</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Token Contract:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-800 font-bold">
                      {faucetInfo.tokenAddress.slice(0, 6)}...{faucetInfo.tokenAddress.slice(-4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(faucetInfo.tokenAddress, "token")}
                      className="text-purple-600 hover:text-purple-800 p-1 cursor-pointer"
                      title="Copy full token address"
                    >
                      {copiedToken ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                    <a
                      href={`https://sepolia.arbiscan.io/address/${faucetInfo.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Decimals:</span>
                  <span className="font-bold text-slate-900">6 (Standard USDC)</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Network:</span>
                  <span className="font-bold text-slate-900">Arbitrum Sepolia (421614)</span>
                </div>
              </div>

              {/* 1-Click MetaMask Import */}
              <button
                type="button"
                onClick={handleAddToMetaMask}
                disabled={isAddingToken}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-purple-600" />
                <span>
                  {tokenAddedSuccess ? "USDC Added to MetaMask!" : "Add Mock USDC to MetaMask (1-Click)"}
                </span>
              </button>
            </div>

            {/* Quick Actions after Claiming */}
            <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-extrabold text-slate-900">What to test with your USDC:</h4>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>
                  <Link href="/explore" className="text-purple-600 hover:underline font-bold">
                    Book a Mentor Session
                  </Link>{" "}
                  with non-custodial milestone escrow.
                </li>
                <li>
                  <Link href="/dashboard" className="text-purple-600 hover:underline font-bold">
                    Stake 100 USDC Collateral
                  </Link>{" "}
                  to earn the Verified Mentor badge.
                </li>
                <li>
                  <Link href="/course" className="text-purple-600 hover:underline font-bold">
                    Purchase Encrypted Courses
                  </Link>{" "}
                  with on-chain access control.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
