<div align="center">
  <img src="./public/logo-full-white.webp" alt="Trust Lesson" width="340" />

  <h3>Mentorship without the middleman tax or the trust issues.</h3>

  <p>
    Non-custodial milestone escrow on Arbitrum.<br>
    Mentors keep <strong>100%</strong> of their listed price.<br>
    Both sides receive dual-party Soulbound credentials they actually own.<br>
    Users pay <strong>0 ETH</strong> in gas.
  </p>

  <p>
    <a href="https://trust-lesson.vercel.app"><strong>Live Demo &rarr;</strong></a> &nbsp;&middot;&nbsp;
    <a href="#smart-contracts">Contracts</a> &nbsp;&middot;&nbsp;
    <a href="#architecture">Architecture</a> &nbsp;&middot;&nbsp;
    <a href="#economic-model">Economics</a> &nbsp;&middot;&nbsp;
    <a href="#protocol-evolution">Milestones</a>
  </p>

  <p>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-9333ea?style=flat-square" alt="MIT" /></a>
    <a href="https://sepolia.arbiscan.io/"><img src="https://img.shields.io/badge/Network-Arbitrum%20Sepolia-28A0F0?style=flat-square&logo=arbitrum" alt="Arbitrum Sepolia" /></a>
    <a href="https://soliditylang.org/"><img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity" alt="Solidity" /></a>
    <a href="#smart-contracts"><img src="https://img.shields.io/badge/Contracts-8%20Deployed-10B981?style=flat-square" alt="8 Contracts" /></a>
    <a href="#security"><img src="https://img.shields.io/badge/Tests-74%2F74%20Passing-yellow?style=flat-square" alt="Tests" /></a>
  </p>
</div>

---

## The Problem

Private mentorship and coaching still run on trust and screenshots.

- Learners pay 100% upfront and hope the mentor shows up.
- Mentors deliver and then wait 14&ndash;21 days (or face chargebacks).
- Platforms take 20&ndash;33% while locking reputation inside their walled garden.
- Certificates are just PDFs that anyone can forge.

**Trust Lesson replaces all of that with non-custodial smart contracts.**

---

## Core Value Proposition

| Problem | Solution |
| :--- | :--- |
| Learner pays upfront, mentor ghosts | Funds locked in escrow &mdash; released only on milestone confirmation |
| Mentor delivers, learner refuses payment | Milestone approval triggers automatic release; disputes resolved by 3-of-5 jury |
| No verifiable proof of completion | Dual-party soulbound credentials (W3C JSON-LD + EIP-712) minted on-chain |
| High gas fees kill UX | Pimlico ERC-4337 Paymaster + Platform Gas Sponsor &mdash; users pay **0 ETH** |
| Fiat onboarding is painful | Embedded MoonPay widget (card / Apple Pay &rarr; USDC) |
| Booking collisions | Interactive visual calendar with real-time slot locks |

---

## Live Demo

**[trust-lesson.vercel.app](https://trust-lesson.vercel.app)**  

Book a session with testnet USDC. No real funds required.

---

## Why This Needs Crypto

Traditional platforms extract 20&ndash;33% and still force learners to pay everything upfront while mentors wait weeks for payouts. Reputation dies the moment the platform changes the rules or shuts down.

Trust Lesson locks funds in a **non-custodial escrow** that only releases on mutual confirmation. Mentors receive **100% of their listed price**. Both parties get dual-party Soulbound credentials that live on-chain and can be verified by anyone. The 10% protocol fee is paid by the learner &mdash; never deducted from the mentor.

This market simply cannot exist with the same guarantees without crypto.

---

## Economic Model

| Line Item | Amount |
| :--- | :--- |
| Mentor Listing Price | $50.00 USDC |
| Platform Fee (10%) | $5.00 USDC |
| Gas Fee | **$0.00** (fully sponsored) |
| **Learner Pays** | **$55.00 USDC** |
| **Mentor Receives** | **$50.00 USDC** |

`PLATFORM_FEE_BPS = 1000` (10%). Mentors keep every dollar of the price they set.

---

## Smart Contracts

The protocol encompasses **8 Smart Contracts (7 Production + 1 Testnet Mock)** and **5 Pluggable Modular Interfaces**, deployed on **Arbitrum Sepolia** (Chain ID `421614`), compiled with Solidity `0.8.24` (Cancun EVM target).

| Contract | Address | Role | Status |
| :--- | :--- | :--- | :--- |
| **EscrowRouter (V2)** | [`0x094E4b351272fA45613D7D093B7f3a3C20AeE795`](https://sepolia.arbiscan.io/address/0x094E4b351272fA45613D7D093B7f3a3C20AeE795) | Core milestone escrow vault, pull payments, 10% fee split | Verified |
| **VerifiableCredential** | [`0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D`](https://sepolia.arbiscan.io/address/0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D) | Dual-party W3C JSON-LD + EIP-712 Soulbound credentials | Verified |
| **SkillGraph** | [`0x99303483484cc2c9393138574969f15C415A3016`](https://sepolia.arbiscan.io/address/0x99303483484cc2c9393138574969f15C415A3016) | On-chain composable skill tree + prerequisite gating | Verified |
| **DisputeCouncil** | [`0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006`](https://sepolia.arbiscan.io/address/0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006) | 3-of-5 jury council with dynamic sortition | Verified |
| **MentorStaking** | [`0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd`](https://sepolia.arbiscan.io/address/0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd) | Economic collateral vault ($100 USDC threshold) + slashing | Verified |
| **ReputationRegistry** | [`0x14BBB05C74fBcD2E122E197FD244b54dFb171587`](https://sepolia.arbiscan.io/address/0x14BBB05C74fBcD2E122E197FD244b54dFb171587) | Soulbound reputation ledger, star ratings & counts | Verified |
| **VideoAccess** | [`0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023`](https://sepolia.arbiscan.io/address/0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023) | Content access registry for Cloudflare Stream courses | Verified |
| **MockUSDC** | Local / Sandbox | ERC-20 6-decimal test token with automated faucet | Testnet Mock |

### Modular Interfaces (`contracts/interfaces/`)

- `ICredentialIssuer.sol`: Swappable credential issuer interface for EscrowRouter without redeployment.
- `IEscrowRouter.sol`: External interface for DisputeCouncil resolution execution (`resolveDispute`).
- `IKlerosArbitrator.sol`: Progressive decentralization hook for Kleros Court arbitration escalation.
- `IMentorStaking.sol`: Decoupled staking interface for non-custodial dispute slashing.
- `IOptimisticOracle.sol`: Pluggable assertion hook for UMA Optimistic Oracle V3 integration.

**Settlement Token**: [Arbitrum Sepolia USDC (`0x75faf114...`)](https://sepolia.arbiscan.io/address/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d)  
**Gas Sponsor / Paymaster**: [`0xf2cE5319aeB733fd2279a830260316358A036098`](https://sepolia.arbiscan.io/address/0xf2cE5319aeB733fd2279a830260316358A036098) + Pimlico ERC-4337 Paymaster  
**Platform Treasury**: [`0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC`](https://sepolia.arbiscan.io/address/0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC) (Receives 10% protocol fee)

All core contracts are source-verified on Arbiscan.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER LAYER                              │
│  Next.js 15 + React 19 + Tailwind CSS v4                    │
│  MetaMask / Rabby / Coinbase / Rainbow                      │
│  Embedded MoonPay (Card / Apple Pay &rarr; USDC)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  API & INDEXING                             │
│  Hono Edge Router &middot; Ponder Indexer &middot; Prisma + PostgreSQL    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               SMART CONTRACT + AA LAYER                     │
│  EscrowRouter &middot; DisputeCouncil &middot; MentorStaking              │
│  VerifiableCredential &middot; SkillGraph &middot; VideoAccess            │
│  Pimlico ERC-4337 Paymaster (0 gas for users)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     STORAGE                                 │
│  Cloudflare Stream + R2 &middot; Pinata IPFS                       │
│  Fallback: Unlisted YouTube / Restricted Google Drive       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### For Mentors
- **Interactive Availability Calendar**: Visual month calendar to toggle blocked dates, add custom extra availability, and configure meeting links.
- **Curriculum Upload**: Native Cloudflare Stream (HLS signed tokens) + Cloudflare R2 (presigned URLs) for video and document courses.
- **Zero-Budget Hosting Fallback**: Guided setup for Unlisted YouTube and Restricted Google Drive hosting.
- **Student-View Simulator**: Live preview of courses in locked (unpaid) and unlocked (paid) views before publishing.
- **Real Analytics**: Real-time 30-day earnings, active escrow balance, hourly rates, and on-chain reputation stats.
- **Payout Wallet Lock Guard**: Enforce verified recipient address locking on Arbitrum before gig publishing.

### For Learners
- **One-Click MoonPay Fiat On-Ramp**: Embedded brand-tailored widget to buy Arbitrum Sepolia USDC directly with cards or Apple Pay.
- **Interactive Booking Calendar**: Visual month selector with real-time slot reservation locks preventing double-booking.
- **Live Balance & Guard**: Instant USDC + ETH balance inspection with pre-flight check and direct testnet faucet integrations.
- **Visual Transaction Timeline**: Cryptographic milestone status (Created &rarr; Funded &rarr; In Session &rarr; Completed &rarr; Credential).
- **Dual-Party Soulbound Credentials**: Non-transferable completion certificates (W3C JSON-LD + EIP-712) verifiable on Arbiscan.
- **Multi-Layer Idempotency**: Complete protection against duplicate charges, double sessions, and race conditions.

### Shared Platform Capabilities
- **Real-Time Hybrid Chat**: WebRTC DataChannels (peer-to-peer ephemeral messaging) with Pusher offline fallback.
- **Mutual Completion Lock**: Escrow funds release strictly upon mutual milestone verification or jury dispute settlement.
- **3-of-5 DisputeCouncil**: Dynamic juror selection drawn randomly from staked mentors with conflict-of-interest exclusion.
- **Zero Gas Cost**: 100% gas sponsorship via Pimlico ERC-4337 Paymaster and platform relayer.
- **Responsive Mobile Dashboard**: 5-column balanced equal-width student workspace and compact 4x2 mentor grid with zero cut-off or overspace.

---

## Security

| Vector | Implementation & Guarantee | Verification Status |
| :--- | :--- | :--- |
| **Smart Contract Tests** | 74 automated unit & invariant tests covering escrow lifecycle, 10% fee precision, dispute sortition, and slashing | 74/74 Passing (100%) |
| **Reentrancy Protection** | OpenZeppelin `ReentrancyGuard` + CEI pattern on all state-changing fund moves | Enforced |
| **Secret & Key Leak Defense** | Automated Gitleaks scanning (`gitleaks detect -v`) integrated into workflow; 0 credentials or keys committed | 0 Leaks Found |
| **Arithmetic Integrity** | Solidity `0.8.24` native overflow/underflow reverts; 6-decimal USDC fixed-point math | Verified |
| **Sybil & Collusion Defense** | Jurors require &ge; $100 USDC stake, minimum reputation rating, and algorithmic conflict-of-interest exclusion | Enforced |
| **Race Conditions & Idempotency** | 4-layer defense: client receipt recovery, API active enrollment checks, PostgreSQL advisory locks (`pg_advisory_xact_lock`), and contract single-release invariants | Verified |
| **Audit Status** | Pre-audit. Full internal security manual and invariant test suite prepared. Third-party audit scheduled for mainnet rollout. | In Progress |

---

## Protocol Evolution

<details>
<summary><strong>View Milestone History (Phase 1&ndash;8)</strong></summary>

1. **Phase 1 &mdash; Core Protocol Genesis**:
   - Deployed initial `EscrowRouter.sol`, `ReputationRegistry.sol`, and `MentorStaking.sol`.
   - Dual authentication: SIWE (Sign-In with Ethereum, EIP-4361) alongside Web2 email/password JWT.
2. **Phase 2 &mdash; Decentralized Governance & Verifiable Credentials**:
   - Upgraded to dual-party W3C JSON-LD and EIP-712 credentials (`VerifiableCredential.sol`).
   - Implemented on-chain `SkillGraph.sol` with prerequisite skill gating.
   - Designed 3-of-5 jury `DisputeCouncil.sol` with dynamic sortition and IPFS evidence hashes.
   - Built real-time event indexer with Ponder.
3. **Phase 3 &mdash; Frictionless UX & Multi-Wallet Support**:
   - Engineered JIT Gas Fee Subsidy from platform sponsor wallet (users pay 0 ETH).
   - Added multi-wallet selection modal for 5 Web3 providers (MetaMask, Rabby, Coinbase, Rainbow, WalletConnect).
   - Integrated Google Meet & Zoom meeting auto-generation upon session acceptance.
   - Built hybrid ephemeral P2P messaging using WebRTC DataChannels with Pusher offline fallback.
   - Created Financial Audit Hub & Admin Command Center for protocol TVL and dispute tracking.
4. **Phase 4 &mdash; Content Gating & Curated Education**:
   - Integrated Cloudflare Stream (signed HLS tokens) and Cloudflare R2 (presigned URLs) for tamper-proof course delivery.
   - Created Zero-Budget Hosting fallback (unlisted YouTube & restricted Google Drive).
   - Added Student View Simulator (unpaid locked view vs. paid unlocked stream).
   - Implemented Payout Wallet Lock Guard requiring Arbitrum address confirmation before gig publishing.
   - Built public testnet faucet for Circle USDC and Arbitrum Sepolia ETH.
5. **Phase 5 &mdash; Real Analytics & Social Amplification**:
   - Replaced mockups with real database aggregations for 30-day earnings, active escrow volume, and hourly rates.
   - Added Cryptographic Transaction Status Timeline (Created &rarr; Funded &rarr; In Mentorship &rarr; Released &rarr; Attestation).
   - Added dual-stage post-course feedback and 1-click social sharing to X, LinkedIn, and Instagram with pre-composed tags.
6. **Phase 6 &mdash; "Calm Learning Platform" Visual Design System**:
   - Fully refactored all internal app pages to a calm, distraction-free aesthetic.
   - Standardized reusable design tokens (`src/components/ui/DesignTokens.jsx`): `PrimaryButton`, `SecondaryButton`, `GhostButton`, `Card`, `StatCard`, `StatusPill`, and `EmptyState`.
   - Zero horizontal scroll at 375px+ with touch-friendly 44px min-height targets.
7. **Phase 7 &mdash; Multi-Layer Idempotency & Concurrency Hardening**:
   - Implemented on-chain log recovery (`findRecentSessionReceipt`) preventing double billing on queued transactions.
   - Added PostgreSQL advisory locks (`pg_advisory_xact_lock`) serializing calendar slot reservations per mentor.
   - Enforced smart contract single-release invariants and atomic database transactions (`db.$transaction`).
8. **Phase 8 &mdash; Account Abstraction, MoonPay On-Ramp & Interactive Calendar Scheduling**:
   - Integrated Pimlico ERC-4337 Paymaster for seamless zero-gas transaction execution.
   - Embedded custom-tailored MoonPay fiat on-ramp widget supporting card and Apple Pay payments.
   - Developed interactive visual month calendar engine for mentor availability toggling and learner meeting scheduling.
   - Overhauled mobile navigation with balanced equal-width 5-column student tabs and 4x2 mentor grid.

</details>

---

## Tech Stack

| Layer | Stack |
| :--- | :--- |
| **Frontend** | Next.js 15 App Router, React 19, Tailwind CSS v4, Calm Learning Design Tokens |
| **Backend** | Hono Edge Router, Prisma ORM, PostgreSQL / SQLite |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin 5.x |
| **Web3 & Wallets** | Ethers.js v6, Viem, MetaMask, Rabby, Coinbase Wallet, Rainbow |
| **Account Abstraction** | Pimlico ERC-4337 Paymaster & Platform Relayer |
| **Fiat On-Ramp** | MoonPay (Custom Embedded Widget) |
| **Indexing** | Ponder (Real-time sub-second event indexer) |
| **Storage** | Cloudflare Stream, Cloudflare R2, Pinata IPFS |
| **Messaging** | WebRTC DataChannels (P2P ephemeral) + Pusher fallback |

---

## Project Structure

```
Trust-Lesson/
├── app/                                        # Next.js 15 App Router
│   ├── api/[[...route]]/route.js               # Hono API router + WebRTC signaling
│   ├── book/[type]/[id]/page.jsx               # Web3 checkout, MoonPay modal & calendar booking
│   ├── certificate/[id]/page.jsx               # SBT certificate verification
│   ├── dashboard/                              # Role-based workspace
│   │   ├── availability/page.jsx               # Interactive mentor availability calendar
│   │   ├── classes/[enrollmentId]/page.jsx     # Student classroom & deliverables
│   │   ├── classes/[enrollmentId]/schedule/    # Learner meeting request calendar
│   │   ├── gigs/[gigId]/page.jsx               # Mentor gig management & grading
│   │   ├── chat/page.jsx                       # WebRTC P2P messaging
│   │   └── page.jsx                            # Responsive dashboard overview & tabs
│   ├── explore/page.jsx                        # Marketplace catalog
│   └── page.jsx                                # Homepage
├── contracts/                                  # Solidity 0.8.24
│   ├── EscrowRouter.sol                        # Milestone escrow + fee division
│   ├── ReputationRegistry.sol                  # SBT reputation ledger
│   ├── MentorStaking.sol                       # Stake pool + slashing
│   └── VideoAccess.sol                         # Content access gating
├── docs/                                       # Engineering specs
│   ├── system-updates-and-changelog.md         # Detailed design system & idempotency specs
│   ├── code architecture.md                    # Full-stack blueprint
│   ├── classroom-webrtc-architecture.md
│   ├── report.md                               # Technical audit manual
│   └── systematics.md                          # Protocol state machine
├── lib/                                        # Core utilities
│   ├── access.js                               # Authorization controller
│   ├── networkConfig.js                        # Multi-chain switcher
│   ├── gasSponsor.js                           # Paymaster relayer & Pimlico client
│   ├── prisma.js                               # Database client
│   └── jwt.js                                  # SIWE token signing
├── src/
│   ├── hooks/useWebRTCChat.js                  # WebRTC DataChannel hook
│   └── components/ui/                          # Shared UI components & design tokens
├── prisma/                                     # Schema + migrations
├── public/                                     # Static assets
├── scripts/                                    # Deploy + lint automation
└── hardhat.config.cjs                          # Hardhat configuration
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/zhao-leihan/Trust-Lesson.git
cd Trust-Lesson

# Install
npm install

# Database
npx prisma generate
npx prisma db push

# Run
npm run dev
# → http://localhost:3000

# Contracts
npx hardhat compile
npx hardhat test
```

### Requirements
- Node.js v18.18.0+
- MetaMask on Arbitrum Sepolia (`Chain ID: 421614`)
- Testnet USDC from [Circle Faucet](https://faucet.circle.com/)
- Sepolia ETH from [Google Web3 Faucet](https://cloud.google.com/application/web3/faucet/arbitrum/sepolia)

---

## Team

| Role | Name | Handle |
| :--- | :--- | :--- |
| Founder, Protocol Architect & Full-Stack | **Rayhan Young** | [`@0xAnakMommy`](https://github.com/zhao-leihan) |

*Solo-built: smart contract design, full-stack application, and deployment.*

---

## License & Security

- **License**: [MIT](./LICENSE)
- **Security Policy**: [SECURITY.md](./SECURITY.md)
- **Vulnerability Disclosure**: See SECURITY.md for responsible disclosure guidelines
