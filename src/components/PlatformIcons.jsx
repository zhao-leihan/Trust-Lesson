"use client";

import React from "react";

/**
 * Ikon Vektor Resmi YouTube (SVG Murni - Tanpa Emoji)
 */
export function YouTubeIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
    >
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Ikon Vektor Resmi Google Drive (SVG Murni - Tanpa Emoji)
 */
export function GoogleDriveIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
    >
      <path d="M8.28 2.25L14.7 13.35H21.12L14.7 2.25H8.28Z" fill="#FFC107" />
      <path d="M2.88 21.75L6.09 16.2H18.96L15.75 21.75H2.88Z" fill="#1976D2" />
      <path d="M2.88 21.75L9.3 10.65L12.51 16.2L6.09 21.75H2.88Z" fill="#4CAF50" />
    </svg>
  );
}
