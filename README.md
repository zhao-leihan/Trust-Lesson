# 🎓 Trust Lesson

> **Your Knowledge. On-Chain.**  
> A decentralized, peer-to-peer mentorship and milestone gig exchange protected by non-custodial smart escrow contracts on **Arbitrum**.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Frontend-Next.js%2015%20App%20Router-black.svg)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg)](https://tailwindcss.com)
[![Network: Arbitrum](https://img.shields.io/badge/Network-Arbitrum%20Sepolia%20%7C%20Arbitrum%20One-28A0F0.svg)](https://arbitrum.io)
[![Solidity 0.8.24](https://img.shields.io/badge/Smart%20Contracts-Solidity%200.8.24%20(Cancun)-363636.svg)](https://soliditylang.org/)
[![Security Policy](https://img.shields.io/badge/Security-Policy%20Enforced-emerald.svg)](./SECURITY.md)
[![Tests: 65 Passing](https://img.shields.io/badge/Hardhat%20Tests-65%20Passing%20(100%25)-brightgreen.svg)](./test)

---

## 🌟 Overview

**Trust Lesson** eliminates payment risk and ghosting in private mentorship and freelance coaching. By combining milestone-based escrow vaults with on-chain reputation verification, learners book sessions with complete confidence and mentors are guaranteed 100% of their earnings upon verified delivery.

### 🛡️ Why Trust Lesson?
- **Non-Custodial Smart Escrow V2**: Funds are locked in audited Arbitrum smart contracts until the learner approves milestone deliverables.
- **100% Mentor Base Earning Guarantee**: Mentors receive 100% of their listed fee without platform deductions.
- **Fair 10% Protocol Cut**: A transparent 10% operational fee (`PLATFORM_FEE_BPS = 1000`) is calculated upfront on-chain.
- **100% Gas Subsidy**: The Platform Gas Sponsor vault subsidizes transaction costs so users need 0 ETH for gas.
- **Real Web3 MetaMask Integration**: Live USDC and ETH balance querying, pre-flight insufficient balance warnings, and seamless network switching.
- **Composable Verifiable Credentials (W3C JSON-LD + EIP-712)**: Tamper-proof, non-transferable on-chain proof of completion issued to both student and mentor, exportable as W3C JSON-LD for instant verification by external DAOs and job boards without logging into the platform.
- **On-Chain Skill Graph & Prerequisite Gating**: Completed sessions level up on-chain skill nodes (Level 1, 2, 3) with prerequisite tree verification.
- **Decentralized Dispute Council (Phase 1.5 Multi-Sig)**: 3-of-5 juror quorum replacing single arbiter, 72h resolution timelock, transparent IPFS evidence hashes, and pluggable Kleros Court / UMA Optimistic Oracle hooks.
- **Real-Time Ponder Indexer**: Blazing-fast on-chain event indexing across Arbitrum Sepolia for sub-second dashboard updates.
- **The Lesson Monster Universe**: A playful, gamified aesthetic with friendly mascot guides throughout your learning journey.
- **100% English Web Experience**: Standardized English UI across all checkout, booking, and dashboard views.

---

## 🔗 Live Smart Contracts (Arbitrum Sepolia Testnet — V2 Architecture)

All smart contracts are compiled with Solidity `0.8.24` (Cancun EVM target) and actively deployed on **Arbitrum Sepolia** (`Chain ID: 421614`):

| Contract | Address | Explorer Link | Function |
| :--- | :--- | :--- | :--- |
| **EscrowRouter (V2)** | `0x094E4b351272fA45613D7D093B7f3a3C20AeE795` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x094E4b351272fA45613D7D093B7f3a3C20AeE795) | Modular milestone escrow vault with 10% protocol cut distribution & multi-sig dispute resolution |
| **VerifiableCredential** | `0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D) | Dual-party W3C & EIP-712 credential ledger (Learner Completion & Mentor Delivery) |
| **SkillGraph** | `0x99303483484cc2c9393138574969f15C415A3016` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x99303483484cc2c9393138574969f15C415A3016) | On-chain composable skill tree with prerequisite gating & level progression |
| **DisputeCouncil** | `0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006) | Decentralized 3-of-5 jury council with on-chain dynamic sortition, conflict filter & Kleros Court hooks |
| **MentorStaking** | `0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd) | Economic stake pool with on-chain Tier verification (PRO/MASTER) & automated slashing |
| **VideoAccess** | `0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023) | On-chain course content access gating |
| **USDC Token** | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d) | Official native Arbitrum Sepolia USDC settlement token |
| **Gas Sponsor Relayer**| `0xf2cE5319aeB733fd2279a830260316358A036098` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xf2cE5319aeB733fd2279a830260316358A036098) | Platform gas subsidy vault absorbing 100% of L2 gas |
| **Platform Treasury** | `0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC) | Cold treasury vault receiving the 10% protocol cut |

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) App Router + [React 19](https://react.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/) |
| **Backend & API** | Node.js Edge-ready [Hono](https://hono.dev/) Router (`app/api/[[...route]]`) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) + SQLite (local development) / PostgreSQL |
| **Smart Contracts** | [Solidity 0.8.20](https://soliditylang.org/) + [Hardhat](https://hardhat.org/) + [OpenZeppelin 5.x](https://openzeppelin.com/) |
| **Blockchain L2** | [Arbitrum Sepolia](https://sepolia.arbiscan.io/) (Testnet) / [Arbitrum One](https://arbiscan.io/) (Mainnet) |
| **Web3 Providers** | [Ethers.js v6](https://docs.ethers.org/) + [Viem](https://viem.sh/) (MetaMask, Rabby, Coinbase Wallet) |
| **Fiat On-Ramp** | [Transak Gateway](https://transak.com/) (Visa, Mastercard, Apple Pay) |
| **Media & Storage** | [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/) (HLS DRM) + [Pinata IPFS](https://pinata.cloud/) |

---

## 🚀 Key Features

### 1. 🧑‍🏫 Mentor Hub & Workspace
- **Overview Dashboard**: Monthly earnings, active escrow pool, on-chain reputation score, and hourly rate analytics.
- **Course & Gig Management**: Publish learning packages with mandatory video verification preview.
- **Escrow Wallet**: Track pending escrow deposits, milestone status, and withdraw settled earnings.
- **Portfolio Showcase**: Interactive portfolio editor with live demo URLs, GitHub repositories, and tech stack tags.

### 2. 🎓 Student Workspace
- **Live MetaMask Balance**: View connected Arbitrum Sepolia USDC and ETH balances directly in the checkout card.
- **Insufficient Balance Protection**: Clear warning states and direct faucet links (Circle USDC & Sepolia ETH) when balance is below required deposit.
- **Milestone Progress Tracker**: Step-by-step visibility (*Escrow Deposited → In Session → Confirmed & Released*).
- **Dispute Resolution Engine**: Transparent 48-hour dispute resolution with evidence hashing to IPFS.
- **Soulbound Credentials**: Automatic minting of tamper-proof completion certificates linked to Arbiscan.

### 3. 💳 Economic Model & Fee Mechanics
- **Mentor Listing**: e.g., **$50.00 USDC** base price.
- **Platform Protocol Cut (10%)**: **$5.00 USDC** calculated upfront on-chain.
- **Arbitrum Gas Fee**: **FREE** (100% subsidized by the Platform Gas Sponsor).
- **Grand Total Paid by Learner**: **$55.00 USDC**.
- **Net Payout to Mentor**: **$50.00 USDC** (100% of base price).

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.18.0 or higher recommended)
- [MetaMask](https://metamask.io/) browser extension configured for Arbitrum Sepolia (`Chain ID: 421614`)
- Testnet USDC from [Circle Faucet](https://faucet.circle.com/) and Sepolia ETH from [Google Web3 Faucet](https://cloud.google.com/application/web3/faucet/arbitrum/sepolia)

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/zhao-leihan/Trust-Lesson.git
   cd Trust-Lesson
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Smart Contract Compilation & Testing**:
   ```bash
   npx hardhat compile
   npx hardhat test
   ```

---

## 📂 Project Structure

```text
Trust-Lesson/
├── app/                          # Next.js 15 App Router
│   ├── api/[[...route]]/route.js # Unified Hono API router
│   ├── about/page.jsx            # Platform narrative & leadership profiles
│   ├── book/[type]/[id]/page.jsx # Real Web3 checkout & live MetaMask balance
│   ├── certificate/[id]/page.jsx # Soulbound SBT certificate verification
│   ├── dashboard/page.jsx        # Role-based workspace (Learner, Mentor, Admin)
│   ├── explore/page.jsx          # Marketplace catalog with instant search
│   └── page.jsx                  # Homepage with live ecosystem statistics
├── contracts/                    # Solidity 0.8.20 Smart Contracts
│   ├── EscrowRouter.sol          # Milestone escrow vault & 10% fee division
│   ├── ReputationRegistry.sol    # Soulbound Token (SBT) reputation ledger
│   ├── MentorStaking.sol         # Mentor stake pool & slashing engine
│   └── VideoAccess.sol           # On-chain course content gating
├── docs/                         # Engineering Specifications
│   ├── code architecture.md      # Full-stack architectural blueprint
│   ├── report.md                 # Technical audit & verification manual
│   └── systematics.md            # Protocol lifecycle & state machine
├── lib/                          # Core Protocol Utilities
│   ├── networkConfig.js          # Master Multi-Chain Switcher (Testnet / Mainnet)
│   ├── gasSponsor.js             # Gas Paymaster Relayer engine
│   ├── prisma.js                 # Database client
│   └── jwt.js                    # SIWE token signing & verification
├── prisma/                       # Prisma ORM schemas & SQLite database
├── public/                       # Static brand assets & Lesson Monster characters
├── scripts/                      # Deployment & test automation scripts
│   ├── deploy.cjs                # Full suite contract deployer
│   └── deployEscrow10Percent.cjs # Dedicated EscrowRouter deployer
└── hardhat.config.cjs            # Hardhat L2 compiler & network configuration
```

---

## 👥 Leadership & Team

- **Rayhan Young** — *Chief Technology Officer (CTO) & Core Protocol Architect* (`@0xAnakMommy`)
- **Janetiloy** — *Chief Marketing Officer (CMO) & Global Growth Lead* (`@Janetiloy`)

---

## 📄 License & Security

- **License**: Released under the [MIT License](./LICENSE).
- **Security Policy**: For vulnerability disclosures and escrow safety guidelines, see [SECURITY.md](./SECURITY.md).
