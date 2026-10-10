"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getActiveNetwork } from "../../lib/networkConfig";

export function useWalletBalances(targetAddress) {
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalances = useCallback(async () => {
    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      setUsdcBalance(null);
      setEthBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const activeNet = getActiveNetwork();
      const rpcUrl = activeNet.rpcUrl || "https://sepolia-rollup.arbitrum.io/rpc";
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const usdcAddress = activeNet.contracts.usdc || process.env.NEXT_PUBLIC_USDC_ADDRESS;
      const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];

      const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);

      const [rawUsdc, rawEth] = await Promise.all([
        usdcContract.balanceOf(targetAddress).catch((err) => {
          console.warn("[useWalletBalances] Error fetching USDC balanceOf:", err);
          return 0n;
        }),
        provider.getBalance(targetAddress).catch((err) => {
          console.warn("[useWalletBalances] Error fetching ETH balance:", err);
          return 0n;
        }),
      ]);

      const formattedUsdc = Number(rawUsdc) / 1e6;
      const formattedEth = Number(ethers.formatEther(rawEth));

      setUsdcBalance(formattedUsdc);
      setEthBalance(formattedEth);
    } catch (err) {
      console.warn("[useWalletBalances] Failed to fetch balances:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    fetchBalances();

    // Listen for MetaMask account or chain changes
    if (typeof window !== "undefined" && window.ethereum?.on) {
      const handleAccounts = () => fetchBalances();
      const handleChain = () => fetchBalances();
      window.ethereum.on("accountsChanged", handleAccounts);
      window.ethereum.on("chainChanged", handleChain);
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccounts);
          window.ethereum.removeListener("chainChanged", handleChain);
        }
      };
    }
  }, [fetchBalances]);

  return {
    usdcBalance,
    ethBalance,
    isLoading,
    error,
    refreshBalances: fetchBalances,
  };
}
