"use client";

import React, { useState } from "react";

export const USDC_LOGO_URL = "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png";
export const USDT_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original";
export const ARB_LOGO_URL = "https://wp.logos-download.com/wp-content/uploads/2024/01/Arbitrum_Logo.png?dl";

export function UsdcIcon({ size = 16, className = "" }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="16" cy="16" r="16" fill="#2775CA" />
        <path
          d="M20.5 18.2c0-2-1.2-2.7-3.5-3-1.6-.3-1.9-.7-1.9-1.5 0-.8.6-1.3 1.9-1.3 1.2 0 1.8.4 2.1 1.2.1.2.3.3.5.3h1.2c.3 0 .5-.2.4-.5-.4-1.4-1.6-2.4-3.2-2.6V9.4c0-.3-.2-.5-.5-.5h-1.1c-.3 0-.5.2-.5.5v1.4c-1.8.2-3 1.4-3 3 0 1.9 1.2 2.6 3.5 3 1.5.3 1.9.8 1.9 1.5 0 .9-.8 1.4-2.1 1.4-1.5 0-2.2-.6-2.4-1.5 0-.2-.2-.4-.5-.4h-1.3c-.3 0-.5.2-.5.5.3 1.7 1.7 2.7 3.7 2.9v1.4c0 .3.2.5.5.5h1.1c.3 0 .5-.2.5-.5v-1.4c1.9-.3 3.3-1.5 3.3-3.1z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }
  return (
    <img
      src={USDC_LOGO_URL}
      alt="USDC"
      width={size}
      height={size}
      onError={() => setErr(true)}
      className={`rounded-full shrink-0 object-contain inline-block align-middle ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

export function UsdtIcon({ size = 16, className = "" }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path
          d="M17.5 17.5v6.5h-3v-6.5C11.5 17.3 9 16.3 9 15c0-1.4 2.7-2.5 6-2.5V8.5h2v4c3.3 0 6 1.1 6 2.5 0 1.3-2.5 2.3-5.5 2.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }
  return (
    <img
      src={USDT_LOGO_URL}
      alt="USDT"
      width={size}
      height={size}
      onError={() => setErr(true)}
      className={`rounded-full shrink-0 object-contain inline-block align-middle ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

export function ArbitrumIcon({ size = 16, className = "" }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
        <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="#213147" />
        <path d="M68.5 70L50 35.5L41 52.5L50 69.5L68.5 70Z" fill="#28A0F0" />
        <path d="M31.5 70L45.5 43.5L37 27.5L18.5 62L31.5 70Z" fill="#96BEDC" />
        <path d="M50 35.5L64 62L76.5 53.5L54.5 12L50 35.5Z" fill="#12AAFF" />
      </svg>
    );
  }
  return (
    <img
      src={ARB_LOGO_URL}
      alt="Arbitrum"
      width={size}
      height={size}
      onError={() => setErr(true)}
      className={`shrink-0 object-contain inline-block align-middle ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

// Fallback aliases for backward compatibility
export const UsdgIcon = UsdtIcon;
export const IdrxIcon = UsdcIcon;

export const CURRENCY_OPTIONS = [
  {
    id: "USDC",
    label: "USDC",
    fullName: "USD Coin (Arbitrum)",
    icon: UsdcIcon,
    symbol: "$",
    defaultRate: 1,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "USDT",
    label: "USDT",
    fullName: "Tether USD (Arbitrum)",
    icon: UsdtIcon,
    symbol: "$",
    defaultRate: 1,
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
];

export function CurrencyBadge({ currency = "USDC", size = "sm", className = "" }) {
  const norm = currency?.toUpperCase() === "USDT" || currency?.toUpperCase() === "USDG" ? "USDT" : "USDC";
  const curr = CURRENCY_OPTIONS.find((c) => c.id === norm) || CURRENCY_OPTIONS[0];
  const Icon = curr.icon;
  const isLg = size === "lg";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs transition-all ${
        curr.id === "USDT"
          ? "bg-teal-50 text-teal-800 border-teal-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
      } ${isLg ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"} ${className}`}
    >
      <Icon size={isLg ? 16 : 13} />
      <span>{curr.label}</span>
    </span>
  );
}

export function formatPriceCurrency(price, currency = "USDC") {
  const num = Number(price) || 0;
  const norm = currency?.toUpperCase() === "USDT" || currency?.toUpperCase() === "USDG" ? "USDT" : "USDC";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${norm}`;
}
