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
    <a href="https://sepolia.arbiscan.io/"><img src="https://img.shields.io/badge/Network-Arbitrum%20Sepolia-28A0F0.svg?style=flat-square&logo=arbitrum" alt="Arbitrum Sepolia" /></a>
    <a href="https://soliditylang.org/"><img src="https://img.shields.io/badge/Solidity-0.8.24%20(Cancun)-363636.svg?style=flat-square&logo=solidity" alt="Solidity 0.8.24" /></a>
    <a href="#smart-contracts"><img src="https://img.shields.io/badge/Contracts-8%20Deployed-10B981.svg?style=flat-square" alt="8 Contracts Deployed" /></a>
    <a href="#security"><img src="https://img.shields.io/badge/Tests-Hardhat%20%2B%20Foundry-yellow.svg?style=flat-square" alt="Tests" /></a>
  </p>
</div>

---

## Live Demo

**[trust-lesson.vercel.app](https://trust-lesson.vercel.app)** — Book a mentorship session with testnet USDC. No real funds required.

---

## Overview

**Trust Lesson** eliminates payment risk and ghosting in private mentorship and freelance coaching. Milestone-based escrow vaults lock funds on-chain until the learner approves deliverables. Upon completion, both parties receive tamper-proof, non-transferable credentials.

### Core Value Proposition

| Problem | Solution |
| :--- | :--- |
| Learner pays upfront, mentor ghosts | Funds locked in escrow — released only on milestone confirmation |
| Mentor delivers, learner refuses payment | Milestone approval triggers automatic release; disputes resolved by 3-of-5 jury |
| No verifiable proof of completion | Dual-party soulbound credentials (W3C JSON-LD + EIP-712) minted on-chain |
| High gas fees pricing out users | Platform-sponsored gas relayer — users pay 0 ETH |

---

## Smart Contracts

The protocol encompasses **8 Smart Contracts (7 Production + 1 Testnet Mock)** and **5 Pluggable Modular Interfaces**, deployed on **Arbitrum Sepolia** (`Chain ID: 421614`) and compiled with Solidity `0.8.24` (Cancun EVM target).

### Core Contracts (8)

| Contract | File | Deployed Address | Function | Status |
| :--- | :--- | :--- | :--- | :--- |
| **EscrowRouter (V2)** | `contracts/EscrowRouter.sol` | [`0x094E...eE795`](https://sepolia.arbiscan.io/address/0x094E4b351272fA45613D7D093B7f3a3C20AeE795) | Core milestone escrow vault, pull payment distribution, 10% protocol fee cut | Verified |
| **VerifiableCredential** | `contracts/VerifiableCredential.sol` | [`0x50fA...6847D`](https://sepolia.arbiscan.io/address/0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D) | Dual-party soulbound credential issuer (W3C JSON-LD + EIP-712 typed digests) | Verified |
| **SkillGraph** | `contracts/SkillGraph.sol` | [`0x9930...A3016`](https://sepolia.arbiscan.io/address/0x99303483484cc2c9393138574969f15C415A3016) | On-chain composable skill tree with prerequisite gating & level progression | Verified |
| **DisputeCouncil** | `contracts/DisputeCouncil.sol` | [`0xAEA0...4B006`](https://sepolia.arbiscan.io/address/0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006) | 3-of-5 jury council with dynamic sortition from staked mentor pool | Verified |
| **MentorStaking** | `contracts/MentorStaking.sol` | [`0xbbD3...281Dd`](https://sepolia.arbiscan.io/address/0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd) | Economic collateral staking vault ($100 USDC verified threshold), 7d timelock, slashing | Verified |
| **ReputationRegistry** | `contracts/ReputationRegistry.sol` | [`0x14BB...171587`](https://sepolia.arbiscan.io/address/0x14BBB05C74fBcD2E122E197FD244b54dFb171587) | Soulbound reputation ledger, cumulative star ratings, and completion counts | Verified |
| **VideoAccess** | `contracts/VideoAccess.sol` | [`0xb7d6...40023`](https://sepolia.arbiscan.io/address/0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023) | Content access registry for Cloudflare Stream courses with USDC purchases | Verified |
| **MockUSDC** | `contracts/test/MockUSDC.sol` | Local / Sandbox | ERC-20 6-decimal test token with public minting faucet for automated tests | Testnet Mock |

### Modular Interfaces (`contracts/interfaces/`)

- `ICredentialIssuer.sol`: Swappable credential issuer interface for EscrowRouter without redeployment.
- `IEscrowRouter.sol`: External interface for DisputeCouncil resolution execution (`resolveDispute`).
- `IKlerosArbitrator.sol`: Progressive decentralization hook for Kleros Court arbitration escalation.
- `IMentorStaking.sol`: Decoupled staking interface for non-custodial dispute slashing.
- `IOptimisticOracle.sol`: Pluggable assertion hook for UMA Optimistic Oracle V3 integration.

**Settlement Token**: [Arbitrum Sepolia USDC (`0x75fa...6AA4d`)](https://sepolia.arbiscan.io/address/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d)  
**Gas Sponsor Relayer**: [`0xf2cE...036098`](https://sepolia.arbiscan.io/address/0xf2cE5319aeB733fd2279a830260316358A036098)  
**Platform Treasury Vault**: [`0x656c...b75eC`](https://sepolia.arbiscan.io/address/0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC) (Receives 10% protocol fee)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  Next.js 15 App Router + React 19 + Tailwind CSS v4             │
│  MetaMask / Rabby / Coinbase Wallet (Ethers.js v6 + Viem)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API & INDEXING                             │
│  Hono Edge Router (app/api/[[...route]])                        │
│  Ponder Indexer — sub-second event indexing                     │
│  Prisma ORM + PostgreSQL (SQLite for local dev)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT LAYER                          │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐    │
│  │ EscrowRouter│──│ DisputeCouncil   │  │ MentorStaking   │    │
│  │ (escrow +   │  │ (3-of-5 jury)    │  │ (stake + slash) │    │
│  │  fee split) │  └──────────────────┘  └─────────────────┘    │
│  └──────┬──────┘                                                │
│         │                                                       │
│  ┌──────▼──────┐  ┌──────────────────┐  ┌─────────────────┐    │
│  │Verifiable   │  │ SkillGraph       │  │ VideoAccess     │    │
│  │Credential   │  │ (skill tree)     │  │ (content gate)  │    │
│  │(SBT + VC)   │  │                  │  │                 │    │
│  └─────────────┘  └──────────────────┘  └─────────────────┘    │
│                                                                 │
│  Gas Sponsor Relayer — subsidizes 100% of user gas costs        │
│  Platform Treasury — receives 10% protocol fee                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                               │
│  Cloudflare Stream (video, HLS signed tokens)                   │
│  Cloudflare R2 (documents, presigned URLs)                      │
│  Pinata IPFS (dispute evidence hashes)                          │
│  Fallback: YouTube Unlisted / Google Drive Restricted           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### For Mentors

| Feature | Description |
| :--- | :--- |
| **Real Database Analytics** | Live 30-day earnings, active escrow volume, on-chain reputation score, and hourly rate metrics |
| **Curriculum Upload** | Native Cloudflare Stream (video) + R2 (documents) with signed HLS tokens |
| **Zero-Budget Hosting** | Unlisted YouTube / restricted Google Drive fallback with setup guides |
| **Student View Simulator** | Preview curriculum from unpaid (locked) and paid (unlocked) perspectives before publishing |
| **Payout Wallet Lock Guard** | Enforce recipient address locking on Arbitrum before gig creation |
| **Portfolio & Bio** | Live demo URLs, GitHub repos, tech stack tags, and leveling badges |

### For Learners

| Feature | Description |
| :--- | :--- |
| **Live Balance Check** | Arbitrum Sepolia USDC + ETH balance check in checkout card |
| **Insufficient Balance Guard** | Pre-flight balance validation + direct testnet faucet integrations |
| **Transaction Status Timeline** | Visual on-chain milestone progress: Created → Funded → In Session → Completed → Attestation |
| **Post-Course Social Sharing** | Instant 1-click sharing to X, LinkedIn, and Instagram with pre-composed hashtags |
| **Multi-Layer Idempotency** | Complete protection against double payments, duplicate session entries, and booking race conditions |
| **Soulbound Credentials** | Dual-party non-transferable completion certificates (W3C JSON-LD + EIP-712) linked to Arbiscan |

---

## Design System & Architecture Updates

### 1. "Calm Learning Platform" Design System
Internal platform routes (`/dashboard`, `/dashboard/requests`, `/leaderboard`, `/dashboard/availability`, `/dashboard/chat`, `/dashboard/classes`, `/dashboard/gigs`) adhere to the Calm Learning design tokens:
- **Palette**: `violet-600` for primary actions, `violet-50` for active pill selections and icon containers, and neutral `gray-100/400/500/900`.
- **Reusable Primitives** (`src/components/ui/DesignTokens.jsx`): `PrimaryButton`, `SecondaryButton`, `GhostButton`, `Card`, `StatCard`, `StatusPill`, and `EmptyState`.
- **Zero Horizontal Scroll**: 100% mobile-responsive down to 375px with touch-friendly 44px targets.

### 2. Multi-Layer Idempotency & Concurrency Guards
- **Web3 Layer**: Client-side `isProcessing` mutex locks plus automated `findRecentSessionReceipt` log query to recover already-broadcasted transactions.
- **API Gateway Layer**: `alreadyEnrolled` active enrollment checks and `onchainSessionId` uniqueness filters.
- **Database Layer**: PostgreSQL transaction-level advisory locks (`pg_advisory_xact_lock`) serializing calendar slot reservations per mentor.
- **Smart Contract Layer**: `require(!milestone.released)` and OpenZeppelin `ReentrancyGuard` preventing duplicate milestone claims.

Detailed technical specs can be found in [docs/system-updates-and-changelog.md](./docs/system-updates-and-changelog.md).

---

### Economic Model

| Line Item | Amount |
| :--- | :--- |
| Mentor Listing (example) | $50.00 USDC |
| Platform Fee (10%) | $5.00 USDC |
| Gas Fee | $0 (subsidized) |
| **Learner Pays** | **$55.00 USDC** |
| **Mentor Receives** | **$50.00 USDC** |

Fee parameter: `PLATFORM_FEE_BPS = 1000` (10%, adjustable by governance).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 App Router, React 19, Tailwind CSS v4, Calm Learning Design Tokens |
| **Backend** | Hono Edge Router, Prisma ORM, PostgreSQL / SQLite |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin 5.x |
| **Web3** | Ethers.js v6, Viem, MetaMask / Rabby / Coinbase Wallet |
| **Indexing** | Ponder (real-time event indexing) |
| **Storage** | Cloudflare Stream, Cloudflare R2, Pinata IPFS |
| **Fiat On-Ramp** | Transak (Visa, Mastercard, Apple Pay) |
| **Messaging** | WebRTC DataChannels (P2P, ephemeral signaling) |

---

## Security & Smart Contract Audit

The protocol is engineered with a defense-in-depth security model spanning smart contracts, API middleware, and database layers:

| Security Vector | Implementation & Guarantee | Verification Status |
| :--- | :--- | :--- |
| **Smart Contract Tests** | 74 automated unit & invariant tests (`npm run test:contracts`) covering escrow state transitions, 10% fee precision, non-reversibility of `COMPLETED`, dispute resolution sortition, and stake slashing | 74/74 Passing (100%) |
| **Reentrancy Protection** | OpenZeppelin `ReentrancyGuard` on all state-changing fund transfers with strict Checks-Effects-Interactions (CEI) | Enforced |
| **Secret & Key Leak Defense** | Automated Gitleaks scanner (`gitleaks detect -v`) integrated into workflow; zero credentials or private keys in repository | 0 Leaks Found |
| **Arithmetic Integrity** | Solidity `0.8.24` native overflow/underflow reverts; 6-decimal USDC fixed-point calculations | Verified |
| **Sybil & Collusion Defense** | Dispute Council jurors randomly selected via block entropy with conflict-of-interest filters and $100 USDC stake threshold | Enforced |
| **Idempotency & Race Protection** | 4-layer deduplication: Web3 client receipt recovery, API active enrollment checks, PostgreSQL advisory locks (`pg_advisory_xact_lock`), and contract single-release invariants | Verified |
| **Audit Status** | **Pre-audit.** Comprehensive internal security report and invariant test suite prepared. Professional third-party audit planned for mainnet rollout. | In Progress |

---

## Protocol Evolution & Major Milestones (Phase 1–7)

1. **Phase 1 — Core Protocol Genesis**:
   - Deployed initial `EscrowRouter.sol`, `ReputationRegistry.sol`, and `MentorStaking.sol`.
   - Dual authentication: SIWE (Sign-In with Ethereum, EIP-4361) alongside Web2 email/password JWT.
2. **Phase 2 — Decentralized Governance & Verifiable Credentials**:
   - Upgraded to dual-party W3C JSON-LD and EIP-712 credentials (`VerifiableCredential.sol`).
   - Implemented on-chain `SkillGraph.sol` with prerequisite skill gating.
   - Designed 3-of-5 jury `DisputeCouncil.sol` with dynamic sortition and IPFS evidence hashes.
   - Built real-time event indexer with Ponder.
3. **Phase 3 — Frictionless UX & Multi-Wallet Support**:
   - Engineered JIT Gas Fee Subsidy from platform sponsor wallet (users pay 0 ETH).
   - Added multi-wallet selection modal for 5 Web3 providers (MetaMask, Rabby, Coinbase, Rainbow, WalletConnect).
   - Integrated Google Meet & Zoom meeting auto-generation upon session acceptance.
   - Built hybrid ephemeral P2P messaging using WebRTC DataChannels with Pusher offline fallback.
   - Created Financial Audit Hub & Admin Command Center for protocol TVL and dispute tracking.
4. **Phase 4 — Content Gating & Curated Education**:
   - Integrated Cloudflare Stream (signed HLS tokens) and Cloudflare R2 (presigned URLs) for tamper-proof course delivery.
   - Created Zero-Budget Hosting fallback (unlisted YouTube & restricted Google Drive).
   - Added Student View Simulator (unpaid locked view vs. paid unlocked stream).
   - Implemented Payout Wallet Lock Guard requiring Arbitrum address confirmation before gig publishing.
   - Built public testnet faucet for Circle USDC and Arbitrum Sepolia ETH.
5. **Phase 5 — Real Analytics & Social Amplification**:
   - Replaced mockups with real database aggregations for 30-day earnings, active escrow volume, and hourly rates.
   - Added Cryptographic Transaction Status Timeline (Created → Funded → In Mentorship → Released → Attestation).
   - Added dual-stage post-course feedback and 1-click social sharing to X, LinkedIn, and Instagram with pre-composed tags.
6. **Phase 6 — "Calm Learning Platform" Visual Design System**:
   - Fully refactored all internal app pages to a calm, distraction-free Notion/Linear aesthetic.
   - Standardized reusable design tokens (`src/components/ui/DesignTokens.jsx`): `PrimaryButton`, `SecondaryButton`, `GhostButton`, `Card`, `StatCard`, `StatusPill`, and `EmptyState`.
   - Zero horizontal scroll at 375px+ with touch-friendly 44px min-height targets.
7. **Phase 7 — Multi-Layer Idempotency & Concurrency Hardening**:
   - Implemented on-chain log recovery (`findRecentSessionReceipt`) preventing double billing on queued MetaMask transactions.
   - Added PostgreSQL advisory locks (`pg_advisory_xact_lock`) serializing calendar slot reservations per mentor.
   - Enforced smart contract single-release invariants and atomic database transactions (`db.$transaction`).

For the full architectural specification, refer to [docs/system-updates-and-changelog.md](./docs/system-updates-and-changelog.md).

---

## Getting Started

### Prerequisites

- Node.js v18.18.0+
- MetaMask configured for Arbitrum Sepolia (`Chain ID: 421614`)
- Testnet USDC from [Circle Faucet](https://faucet.circle.com/)
- Sepolia ETH from [Google Web3 Faucet](https://cloud.google.com/application/web3/faucet/arbitrum/sepolia)

### Local Setup

```bash
# 1. Clone
git clone https://github.com/zhao-leihan/Trust-Lesson.git
cd Trust-Lesson

# 2. Install
npm install

# 3. Database
npx prisma generate
npx prisma db push

# 4. Run
npm run dev
# → http://localhost:3000

# 5. Smart contracts
npx hardhat compile
npx hardhat test
```

---

## Project Structure

```
Trust-Lesson/
├── app/                          # Next.js 15 App Router
│   ├── api/[[...route]]/route.js # Hono API router + WebRTC signaling
│   ├── book/[type]/[id]/page.jsx # Web3 checkout & live balance
│   ├── certificate/[id]/page.jsx # SBT certificate verification
│   ├── dashboard/                # Role-based workspace
│   │   ├── classes/[id]/page.jsx # Student classroom & deliverables
│   │   ├── gigs/[id]/page.jsx    # Mentor gig management & grading
│   │   ├── chat/page.jsx         # WebRTC P2P messaging
│   │   └── page.jsx              # Dashboard overview
│   ├── explore/page.jsx          # Marketplace catalog
│   └── page.jsx                  # Homepage
├── contracts/                    # Solidity 0.8.24
│   ├── EscrowRouter.sol          # Milestone escrow + fee division
│   ├── ReputationRegistry.sol    # SBT reputation ledger
│   ├── MentorStaking.sol         # Stake pool + slashing
│   └── VideoAccess.sol           # Content access gating
├── docs/                         # Engineering specs
│   ├── system-updates-and-changelog.md # Detailed design system & idempotency specs
│   ├── code architecture.md      # Full-stack blueprint
│   ├── classroom-webrtc-architecture.md
│   ├── report.md                 # Technical audit manual
│   └── systematics.md            # Protocol state machine
├── lib/                          # Core utilities
│   ├── access.js                 # Authorization controller
│   ├── networkConfig.js          # Multi-chain switcher
│   ├── gasSponsor.js             # Paymaster relayer
│   ├── prisma.js                 # Database client
│   └── jwt.js                    # SIWE token signing
├── src/
│   ├── hooks/useWebRTCChat.js    # WebRTC DataChannel hook
│   └── components/               # Shared UI components
├── prisma/                       # Schema + migrations
├── public/                       # Static assets
├── scripts/                      # Deploy + lint automation
└── hardhat.config.cjs            # Hardhat configuration
```

---

## Team

| Role | Name | Handle |
| :--- | :--- | :--- |
| Protocol Architect, Solidity, Full-Stack | **Rayhan Young** | [`@0xAnakMommy`](https://github.com/zhao-leihan) |

*Solo-built: smart contract design, full-stack development, and deployment.*

---

## License & Security

- **License**: [MIT](./LICENSE)
- **Security Policy**: [SECURITY.md](./SECURITY.md)
- **Vulnerability Disclosure**: See SECURITY.md for responsible disclosure guidelines
