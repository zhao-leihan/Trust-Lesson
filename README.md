<div align="center">
  <a href="https://github.com/zhao-leihan/Trust-Lesson">
    <img src="./public/logo-full-white.webp" alt="Trust Lesson Logo" width="380" />
  </a>
  <br />
  <br />

  <p align="center">
    <strong>Your Knowledge. On-Chain.</strong><br />
    A decentralized, peer-to-peer mentorship and milestone gig exchange protected by non-custodial smart escrow contracts on <strong>Arbitrum</strong>.
  </p>

  <p align="center">
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-9333ea.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15%20App%20Router-000000.svg?style=flat-square&logo=next.js" alt="Next.js 15" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4.svg?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" /></a>
    <a href="https://arbitrum.io"><img src="https://img.shields.io/badge/Network-Arbitrum%20Sepolia%20%7C%20One-28A0F0.svg?style=flat-square&logo=arbitrum" alt="Arbitrum" /></a>
    <a href="https://soliditylang.org/"><img src="https://img.shields.io/badge/Solidity-0.8.24%20(Cancun)-363636.svg?style=flat-square&logo=solidity" alt="Solidity" /></a>
    <a href="https://cloudflare.com"><img src="https://img.shields.io/badge/Storage-Cloudflare%20Stream%20%2B%20R2-F38020.svg?style=flat-square&logo=cloudflare" alt="Cloudflare" /></a>
    <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Gas-100%25%20Subsidized-10B981.svg?style=flat-square" alt="Gas Subsidized" /></a>
  </p>
</div>

---

## Overview

**Trust Lesson** eliminates payment risk and ghosting in private mentorship and freelance coaching. By combining milestone-based escrow vaults with on-chain reputation verification, learners book sessions with complete confidence and mentors are guaranteed 100% of their earnings upon verified delivery.

### Why Trust Lesson?
- **Non-Custodial Smart Escrow V2**: Funds are locked in audited Arbitrum smart contracts until the learner approves milestone deliverables.
- **Native Access-Gated Content**: Mentors upload curriculum directly through Cloudflare Stream (videos) and Cloudflare R2 (documents) with short-lived signed URLs (1-hour playback tokens, 15-minute download links).
- **Cost-Effective Fallback Hosting**: Zero-budget mentors can host course content via unlisted YouTube and restricted Google Drive links with interactive setup guides.
- **Pre-Publish Student Simulator**: Mentors can inspect and verify their curriculum from both unpaid (locked) and paid (unlocked) perspectives before publishing.
- **100% Mentor Base Earning Guarantee**: Mentors receive 100% of their listed fee without platform deductions.
- **Fair 10% Protocol Cut**: A transparent 10% operational fee (`PLATFORM_FEE_BPS = 1000`) is calculated upfront on-chain.
- **100% Gas Subsidy**: The Platform Gas Sponsor vault subsidizes transaction costs so users need 0 ETH for gas.
- **Real Web3 MetaMask Integration**: Live USDC and ETH balance querying, pre-flight insufficient balance warnings, and seamless network switching.
- **Composable Verifiable Credentials (W3C JSON-LD + EIP-712)**: Tamper-proof, non-transferable on-chain proof of completion issued to both student and mentor, exportable as W3C JSON-LD for instant verification by external DAOs and job boards without logging into the platform.
- **On-Chain Skill Graph & Prerequisite Gating**: Completed sessions level up on-chain skill nodes (Level 1, 2, 3) with prerequisite tree verification.
- **Decentralized Dispute Council (Phase 1.5 Multi-Sig)**: 3-of-5 juror quorum replacing single arbiter, 72h resolution timelock, transparent IPFS evidence hashes, and pluggable Kleros Court / UMA Optimistic Oracle hooks.
- **Real-Time Ponder Indexer**: Blazing-fast on-chain event indexing across Arbitrum Sepolia for sub-second dashboard updates.
- **100% English Web Experience**: Standardized English UI across all checkout, booking, and dashboard views.

---

## Live Smart Contracts (Arbitrum Sepolia Testnet — V2 Architecture)

All smart contracts are compiled with Solidity `0.8.24` (Cancun EVM target) and actively deployed on **Arbitrum Sepolia** (`Chain ID: 421614`):

| Contract | Address | Explorer Link | Function |
| :--- | :--- | :--- | :--- |
| **EscrowRouter (V2)** | `0x22f3aa08A15d24f7D274b33A234d96EDC5A98E88` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x22f3aa08A15d24f7D274b33A234d96EDC5A98E88) | Modular milestone escrow vault with 10% protocol cut distribution & multi-sig dispute resolution |
| **VerifiableCredential** | `0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D) | Dual-party W3C & EIP-712 credential ledger (Learner Completion & Mentor Delivery) |
| **SkillGraph** | `0x99303483484cc2c9393138574969f15C415A3016` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x99303483484cc2c9393138574969f15C415A3016) | On-chain composable skill tree with prerequisite gating & level progression |
| **DisputeCouncil** | `0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006) | Decentralized 3-of-5 jury council with on-chain dynamic sortition, conflict filter & Kleros Court hooks |
| **MentorStaking** | `0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd) | Economic stake pool with on-chain Tier verification (PRO/MASTER) & automated slashing |
| **VideoAccess** | `0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023) | On-chain course content access gating |
| **USDC Token** | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d) | Official native Arbitrum Sepolia USDC settlement token |
| **Gas Sponsor Relayer**| `0xf2cE5319aeB733fd2279a830260316358A036098` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xf2cE5319aeB733fd2279a830260316358A036098) | Platform gas subsidy vault absorbing 100% of L2 gas |
| **Platform Treasury** | `0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC) | Cold treasury vault receiving the 10% protocol cut |

---

## Tech Stack

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
| **Media & Storage** | [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/) (HLS Signed Tokens) + [Cloudflare R2](https://www.cloudflare.com/products/r2/) (Presigned AWS SigV4) + [Pinata IPFS](https://pinata.cloud/) |

---

## Key Features

### 1. Mentor Hub & Workspace
- **Overview Dashboard**: Monthly earnings, active escrow pool, on-chain reputation score, and hourly rate analytics.
- **Native Gated Curriculum Uploads**: Direct video upload pipeline to Cloudflare Stream and multi-document resources to private Cloudflare R2 storage.
- **Cost-Free Hosting Tier**: Support for YouTube (Unlisted) videos and Google Drive (Restricted) documents with step-by-step upload guides for mentors with no storage budget.
- **Student View Simulator**: Pre-publish verification modal to preview curriculum gating from both unpaid and paid student states.
- **Escrow Wallet**: Track pending escrow deposits, milestone status, and withdraw settled earnings.
- **Portfolio Showcase**: Interactive portfolio editor with live demo URLs, GitHub repositories, and tech stack tags.

### 2. Student Workspace
- **Live MetaMask Balance**: View connected Arbitrum Sepolia USDC and ETH balances directly in the checkout card.
- **Insufficient Balance Protection**: Clear warning states and direct faucet links (Circle USDC & Sepolia ETH) when balance is below required deposit.
- **Milestone Progress Tracker**: Step-by-step visibility (*Escrow Deposited → In Session → Confirmed & Released*).
- **Dispute Resolution Engine**: Transparent 48-hour dispute resolution with evidence hashing to IPFS.
- **Soulbound Credentials**: Automatic minting of tamper-proof completion certificates linked to Arbiscan.

### 3. Economic Model & Fee Mechanics
- **Mentor Listing**: e.g., **$50.00 USDC** base price.
- **Platform Protocol Cut (10%)**: **$5.00 USDC** calculated upfront on-chain.
- **Arbitrum Gas Fee**: **FREE** (100% subsidized by the Platform Gas Sponsor).
- **Grand Total Paid by Learner**: **$55.00 USDC**.
- **Net Payout to Mentor**: **$50.00 USDC** (100% of base price).

---

## Getting Started

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

## Project Structure

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

## Leadership & Creator

- **Rayhan Young** — *Founder, Lead Protocol Architect & Full-Stack Developer* (`@0xAnakMommy`)

---

## License & Security

- **License**: Released under the [MIT License](./LICENSE).
- **Security Policy**: For vulnerability disclosures and escrow safety guidelines, see [SECURITY.md](./SECURITY.md).
