# Trust Lesson — Comprehensive System Updates & Architecture Manual
**Document Version:** 2.1.0  
**Last Updated:** October 2026  
**Target Network:** Arbitrum One / Arbitrum Sepolia (`Chain ID: 421614`)  
**Core Framework:** Next.js 15 App Router, React 19, Tailwind CSS v4, Hono, Prisma ORM, Ethers.js v6  

---

## 1. Executive Summary of Updates

Recent iterations of the Trust Lesson protocol have focused on:
1. **Calm Learning Platform Design System**: Transitioning the entire internal web application to a focused, calm Notion/Linear aesthetic with modular tokens and mobile-first responsiveness.
2. **Multi-Layer Idempotency & Transaction Safety**: Guaranteeing zero duplicate billing, race-safe slot reservations, and automated on-chain receipt recovery.
3. **Real Database Analytics & Transaction Timeline**: Eliminating mockups and presenting real cryptographic escrow timelines alongside verified on-chain analytics.
4. **Post-Course Feedback & Social Amplification**: Dual-phase modal enabling student evaluation and 1-click social sharing to X, LinkedIn, and Instagram.
5. **Decentralized Jury Sortition & Escrow Arbitration**: 3-of-5 juror council with economic staking and reputation qualifications.
6. **Verifiable Credentials (V2) & SkillGraph Engine**: Composable EIP-712 / W3C JSON-LD soulbound credentials.

---

## 2. Calm Learning Platform Design System

### 2.1 Aesthetic & Design Philosophy
The internal application has been standardized to the **"Calm Learning Platform"** design philosophy—providing an uncluttered, trustworthy workspace reminiscent of Linear and Notion rather than a noisy crypto exchange.

- **Primary Accent (`violet-600` / `#7C3AED`)**: Reserved strictly for Primary CTAs and active navigation items.
- **Soft Accent (`violet-50` / `#F5F3FF`)**: Applied to active card containers, icon backdrops, and active tab pills.
- **Deep Tone (`violet-900` / `#2E1065`)**: Used for high-emphasis headings.
- **Neutral Palette**: `gray-900` (primary text), `gray-500` (secondary copy), `gray-400` (labels/captions), `gray-100` (dividers and borders), `white` (content cards).
- **Semantic Feedback**: `emerald-600` (success, confirmed, verified), `amber-500` (pending, warning), `rose-500` (error, disputed).
- **Gradients**: Strictly constrained to Primary CTA buttons (`from-violet-600 to-violet-700`); flat styling across all other cards and badges.

### 2.2 Reusable Design Tokens (`src/components/ui/DesignTokens.jsx`)
To prevent visual drift and styling regressions, standard components are centralized:

```jsx
// Key primitives available across all internal routes:
import {
  PrimaryButton,    // min-h-[44px], rounded-full, gradient CTA, active scale
  SecondaryButton,  // rounded-full, white card background, subtle border
  GhostButton,      // rounded-full, text-gray-500 hover:bg-gray-100
  Card,             // rounded-2xl, border border-gray-100, shadow-xs hover:shadow-md
  StatCard,         // unified metric card with violet-50 icon container and tabular nums
  StatusPill,       // rounded-full semantic pill badge with color mapping
  EmptyState        // standardized zero-data state with icon, title, description, and CTA
} from "@/src/components/ui/DesignTokens";
```

### 2.3 Unified Internal Routes
The following internal application routes are fully refactored to use the design tokens:
- **`/dashboard`**: Unified stats cards (30-day earnings, escrow pool, reputation, hourly rate), simplified profile header with 3 rounded-full badges, and horizontal-scroll-hidden tab bar.
- **`/dashboard/requests`**: Clean request items with semantic status pills and distinct Primary (Accept) / Ghost (Decline) action buttons.
- **`/leaderboard`**: Top-3 podium spotlight cards with subtle violet rings, tabular numerals, and pill-group category selectors.
- **`/dashboard/availability`**: Rounded slot chips, timezone indicators, and unified card containers.
- **`/dashboard/chat`**: Clean split-panel layout, `bg-violet-50` active conversation indicator, distinct message bubbles (sent: violet, received: gray-100), and mobile-responsive fullscreen conversation toggle.
- **`/dashboard/classes` & `/dashboard/classes/[enrollmentId]`**: Class listing, module roadmap, real-time transaction progress tracker, and assignment review.
- **`/dashboard/classes/[enrollmentId]/schedule`**: Calendar date chips and time slot selector.
- **`/dashboard/gigs/create` & `/dashboard/gigs/[gigId]`**: 4-step wizard with modern pill stepper, payout wallet lock validation, and live preview modal.

---

## 3. Idempotency & Transaction Safety Architecture

To protect learners and mentors from network instability, double payments, and race conditions, the protocol enforces idempotency across four distinct layers:

```
[Layer 1: Web3 Client] ──> isProcessing Lock + findRecentSessionReceipt Log Check
                                       │
[Layer 2: API Gateway]  ──> Idempotency-Key Header + Double Payment Guard
                                       │
[Layer 3: Database Engine] ──> PostgreSQL Advisory Lock + Prisma $transaction
                                       │
[Layer 4: Smart Contracts] ──> ReentrancyGuard + Single-Release / Ownership Reverts
```

### 3.1 Layer 1: Web3 Client Idempotency (`app/book/[type]/[id]/page.jsx`)
- **Button State Locking**: The `isProcessing` boolean disables checkout triggers immediately on click, preventing double-click submissions.
- **On-Chain Log Recovery (`findRecentSessionReceipt`)**: If a student clicks submit while a previous MetaMask transaction is pending or already mined in an earlier block, the client queries recent `SessionCreated` event logs on Arbitrum:
  ```javascript
  const matching = [...logs].reverse().find(
    (l) =>
      String(l.args.learner).toLowerCase() === studentAddress.toLowerCase() &&
      String(l.args.mentor).toLowerCase() === targetMentorAddress.toLowerCase() &&
      BigInt(l.args.totalAmount) === totalUnits
  );
  ```
  If an existing transaction receipt is recovered, the client proceeds directly to enrollment synchronization without initiating a redundant deposit.

### 3.2 Layer 2: API Gateway Guards (`app/api/[[...route]]/route.js`)
- **Active Enrollment Deduplication**: When receiving `POST /api/enrollments`, the server queries whether an enrollment already exists for `learnerId` and `gigId` with status in `["FUNDED", "IN_SESSION", "COMPLETED"]`. If found, it returns `alreadyEnrolled: true` alongside the existing record.
- **Session ID Uniqueness**: Uses `onchainSessionId` as an explicit unique constraint. Requests referencing an already recorded session return the original record idempotently.
- **`Idempotency-Key` Header**: For meeting bookings (`POST /api/enrollments/:id/meetings`), client-supplied `Idempotency-Key` headers are mapped to `externalId: req:${idempotencyKey}` to eliminate duplicate booking records.

### 3.3 Layer 3: Database Concurrency & Race-Safe Booking
- **PostgreSQL Advisory Locks (`pg_advisory_xact_lock`)**: Scheduling requests acquire a transaction-scoped advisory lock on a hash of the mentor's ID:
  ```sql
  SELECT pg_advisory_xact_lock(mentorLockKey);
  ```
  This serializes concurrent booking attempts for the same mentor, preventing overlapping calendar bookings.
- **Atomic Quota Reservation (`reserveQuota`)**: Enclosed in a `db.$transaction`, quota decrement and ledger entries (`QuotaLedger`) occur atomically.

### 3.4 Layer 4: Smart Contract Safety
- **Milestone Release Guard**: `EscrowRouter.sol` verifies `require(!milestone.released, "Already released")`, guaranteeing funds cannot be paid out twice.
- **Video Access Gating**: `VideoAccess.sol` verifies `if (accessMap[msg.sender][videoId]) revert AlreadyOwned()`, preventing duplicate purchases.
- **Reentrancy Protection**: All fund-transferring contract methods inherit OpenZeppelin's `ReentrancyGuard`.

---

## 4. Real Database Analytics & Transaction Lifecycle Timeline

### 4.1 On-Chain Transaction Timeline (`TransactionStatusTimeline.jsx`)
Learners and mentors are provided with a visual step-by-step cryptographic audit trail:
1. **Escrow Created**: Initial transaction broadcast on Arbitrum Sepolia (`txHash`).
2. **Funds Deposited in Vault**: Non-custodial lock of USDC tokens in `EscrowRouter.sol`.
3. **In Mentorship**: Milestone sessions active with WebRTC peer communication.
4. **Milestone Released**: Learner confirms deliverable; USDC disbursed to mentor.
5. **Soulbound Credential Minted**: Attestation recorded on `VerifiableCredential.sol`.

### 4.2 Verified Mentor Analytics Engine (`MentorAnalyticsCard.jsx`)
Mock metrics have been replaced with live database aggregations:
- **30-Day Volume & Escrow Pool**: Computed directly from `enrollment.packagePrice` filtered by creation timestamps.
- **Real Completion Rates**: Calculated as `completedSessions / totalBookings`.
- **Reputation Scores**: Sourced from on-chain SBT ratings issued through `ReputationRegistry.sol`.

---

## 5. Post-Course Feedback & Social Amplification Engine

### 5.1 Dual-Stage Completion Flow (`CourseCompletionFeedbackModal.jsx`)
Upon final milestone release:
1. **Stage 1 — Formal Review**: Learner inputs a star rating (1–5) and written feedback, generating a certified evaluation record.
2. **Stage 2 — Social Sharing**: The interface offers pre-tailored social media posts with platform-specific character limits, formatted tags, and Arbiscan transaction links:
   - **X (Twitter)**: Concise summary (< 280 chars) with verified completion hashtags.
   - **LinkedIn**: Professional narrative highlighting competencies acquired and smart escrow protection.
   - **Instagram**: Clipboard copy workflow with structured line breaks and relevant community hashtags.

---

## 6. Decentralized Jury Sortition & Escrow Arbitration

### 6.1 Dispute Council Architecture (`DisputeCouncil.sol`)
If a disagreement arises between mentor and learner:
- A 48-hour dispute window allows either party to escalate to the council with an IPFS CID evidence hash.
- **Eligibility Filter**: Jurors must hold at least 100 USDC staked in `MentorStaking.sol`, have completed 5+ sessions, and maintain a reputation rating of 4.8+.
- **Quorum & Resolution**: A 3-of-5 majority vote executes `resolveDispute(sessionId, releasePercent)` on `EscrowRouter.sol`, distributing funds according to the ruling.

---

## 7. Storage & Gated Access Architecture

| Content Type | Primary Storage | Gating Mechanism | Fallback Option |
| :--- | :--- | :--- | :--- |
| **Video Lessons** | Cloudflare Stream | 1-Hour Signed HLS Tokens (`getSignedPlaybackUrl`) | Unlisted YouTube Embed |
| **Course Documents** | Cloudflare R2 | 15-Minute Presigned Download URLs (`getPresignedR2DownloadUrl`) | Restricted Google Drive Link |
| **Dispute Evidence** | Pinata IPFS | Cryptographic Content CID (`bytes32` digest) | Local Content Hash |
| **P2P Messages** | WebRTC DataChannels | Direct Browser-to-Browser (Zero Server Retention) | Ephemeral In-Memory Signaling |

---

## 8. Verification & Deployment Checklist

Before production release:
1. **Compile & Typecheck**:
   ```bash
   npm run build
   ```
2. **Secret Leak Detection**:
   ```bash
   gitleaks detect -v
   ```
3. **Smart Contract Tests**:
   ```bash
   npx hardhat test
   ```
4. **Environment Audit**: Ensure `NEXT_PUBLIC_ESCROW_CONTRACT`, `NEXT_PUBLIC_RPC_URL`, and token configurations match the target chain deployment.
