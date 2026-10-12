"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../../src/components/Footer";
import {
  Coins,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

export default function FaucetPage() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [isLoading, setIsLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [tokenAddedSuccess, setTokenAddedSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const tokenAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x65BfF36b3FD34c58F6543537871D9066CEbA6A44";

  useEffect(() => {
    // Auto-fill connected wallet if MetaMask is available
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts && accounts[0]) {
            setRecipientAddress(accounts[0]);
            fetchUserBalance(accounts[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  const fetchUserBalance = async (addr) => {
    const target = (addr || recipientAddress).trim();
    if (!target || !/^0x[a-fA-F0-9]{40}$/.test(target)) return;
    setIsCheckingBalance(true);
    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc");
      const erc20 = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      const raw = await erc20.balanceOf(target);
      setUserBalance(ethers.formatUnits(raw, 6));
    } catch (e) {
      console.warn("Could not query balance:", e.message);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleUseConnectedWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setRecipientAddress(accounts[0]);
          fetchUserBalance(accounts[0]);
        }
      } catch (err) {
        setClaimError("Failed to connect wallet: " + err.message);
      }
    } else {
      setClaimError("No Web3 wallet detected. Please enter your address manually.");
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
      fetchUserBalance(targetAddr);
    } catch (err) {
      setClaimError(err.message || "Failed to process faucet claim.");
    } finally {
      setIsLoading(false);
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
              address: tokenAddress,
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16 sm:pt-36 sm:pb-20 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold border border-purple-200">
            <Coins size={14} className="text-purple-600" />
            <span>Arbitrum Sepolia Testnet</span>
            <span>•</span>
            <span className="font-mono">Chain ID 421614</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Get Testnet USDC
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Enter your wallet address to receive free Mock USDC directly into your wallet. Use these tokens for mentor staking, escrow bookings, and transactions across Trust Lesson.
          </p>
        </div>

        {/* Main Claim Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-purple-100 shadow-xl shadow-purple-500/5 space-y-6">
          {/* Success Alert */}
          {claimSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-extrabold text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{claimSuccess.message || "Tokens successfully sent to your wallet!"}</span>
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
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{claimError}</span>
            </div>
          )}

          <form onSubmit={handleClaim} className="space-y-6">
            {/* Wallet Address Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Your Wallet Address
                </label>
                <div className="flex items-center gap-3">
                  {userBalance !== null && (
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <span>Balance:</span>
                      <strong className="text-purple-700 font-bold">{Number(userBalance).toLocaleString()} USDC</strong>
                      <button
                        type="button"
                        onClick={() => fetchUserBalance(recipientAddress)}
                        disabled={isCheckingBalance}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Refresh balance"
                      >
                        <RefreshCw size={11} className={isCheckingBalance ? "animate-spin" : ""} />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleUseConnectedWallet}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Wallet size={13} />
                    <span>Use Connected Wallet</span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                required
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => {
                  setRecipientAddress(e.target.value);
                  if (/^0x[a-fA-F0-9]{40}$/.test(e.target.value.trim())) {
                    fetchUserBalance(e.target.value.trim());
                  }
                }}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-mono text-sm bg-slate-50 focus:bg-white transition-all text-slate-900 outline-none font-bold"
              />
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Select Amount to Claim
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSelectedAmount(amt)}
                    className={`py-3 px-3 rounded-2xl font-black text-xs transition-all border cursor-pointer text-center ${
                      selectedAmount === amt
                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-100"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-200"
                    }`}
                  >
                    {amt} USDC
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Sending USDC to your wallet...</span>
                </>
              ) : (
                <>
                  <Coins size={16} />
                  <span>Get {selectedAmount} Testnet USDC</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click MetaMask Import */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Contract: <code className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">{tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}</code>
            </span>
            <button
              type="button"
              onClick={handleAddToMetaMask}
              disabled={isAddingToken}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-purple-600" />
              <span>{tokenAddedSuccess ? "Added to MetaMask!" : "Add USDC to MetaMask (1-Click)"}</span>
            </button>
          </div>
        </div>

        {/* Quick Testing Links Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-purple-100/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-600" />
            <span>How to use your Testnet USDC on Trust Lesson:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Link
              href="/dashboard"
              className="p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 text-left transition-all group cursor-pointer"
            >
              <p className="font-extrabold text-slate-900 group-hover:text-purple-700">1. Mentor Staking</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Stake 100 USDC to unlock the Verified Mentor badge.</p>
            </Link>
            <Link
              href="/explore"
              className="p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 text-left transition-all group cursor-pointer"
            >
              <p className="font-extrabold text-slate-900 group-hover:text-purple-700">2. Book 1-on-1 Mentors</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Fund non-custodial milestone escrow for sessions.</p>
            </Link>
            <Link
              href="/course"
              className="p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 text-left transition-all group cursor-pointer"
            >
              <p className="font-extrabold text-slate-900 group-hover:text-purple-700">3. Purchase Courses</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Buy on-chain video tutorials with instant access.</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
