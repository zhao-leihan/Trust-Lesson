"use client";

import React from "react";

/**
 * Official MetaMask Fox SVG Icon
 */
export function MetaMaskIcon({ size = 24, className = "" }) {
  return (
    <img
      src="https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/960px-MetaMask_Fox.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20220831120339"
      alt="MetaMask"
      width={size}
      height={size}
      className={`object-contain inline-block shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

/**
 * Official Coinbase Wallet SVG Icon
 */
export function CoinbaseWalletIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="1024" height="1024" rx="230" fill="#0052FF" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M512 800c159.056 0 288-128.944 288-288S671.056 224 512 224 224 352.944 224 512s128.944 288 288 288zm-80-368h160c44.183 0 80 35.817 80 80s-35.817 80-80 80H432c-44.183 0-80-35.817-80-80s35.817-80 80-80z"
        fill="white"
      />
      <rect x="448" y="448" width="128" height="128" rx="20" fill="#0052FF" />
    </svg>
  );
}
