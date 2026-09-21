# SkillBridge Backend Architecture

> **Arbitrum + USDC | Next.js + Tailwind + Radix UI | SaaS-Ready**

Dokumen ini adalah panduan lengkap untuk AI Agent yang akan mengimplementasikan backend SkillBridge. **Frontend saat ini masih menggunakan mockup/data dummy. Tugas pertama: hapus semua mockup dan koneksikan ke backend nyata.**

---

## 1. Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Smart Contract** | Solidity + Foundry | Arbitrum One (EVM), gas murah |
| **Backend API** | Node.js + Hono (or Fastify) + TypeScript | Lightweight, type-safe |
| **Database** | PostgreSQL + Prisma ORM | Relational data (users, sessions, videos) |
| **Real-time** | WebSocket (ws or Socket.io) | Escrow status updates |
| **Storage** | Cloudflare Stream (video) + IPFS (evidence hash) | Hybrid: Web2 speed + Web3 provenance |
| **Auth** | SIWE (Sign-In with Ethereum) + JWT | Wallet-native auth |
| **Indexing** | Custom indexer (viem) | Sync on-chain events to DB |

---

## 2. System Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js       │      │   Backend API    │      │   PostgreSQL    │
│  (Frontend)     │◄────►│  (Node/TS)       │◄────►│  (Prisma)       │
│  - No mockup    │      │  - REST + WS     │      │  - Users        │
│  - Real data    │      │  - Indexer       │      │  - Sessions     │
└────────┬────────┘      └────────┬─────────┘      │  - Videos       │
         │                        │                 └─────────────────┘
         │                        │
         │               ┌────────▼────────┐
         │               │  Arbitrum One   │
         └──────────────►│  • EscrowRouter │
                         │  • Staking      │
                         │  • Reputation   │
                         └─────────────────┘
```

**Rule:** Frontend tidak boleh punya data dummy. Semua data dari API atau on-chain read.

---

## 3. Smart Contract (Arbitrum)

### 3.1 EscrowRouter
**State Machine:**
```
0: CREATED → 1: FUNDED → 2: IN_SESSION → 3: COMPLETED
                    ↘ 4: DISPUTED → 5: RESOLVED
```

**Key Functions:**
- `createSession(mentor, milestones[], token)` → Learner deposit USDC
- `confirmMilestone(sessionId, index)` → Release dana spesifik
- `raiseDispute(sessionId, evidenceHash)` → Freeze dana
- `resolveDispute(sessionId, releasePercent)` → Jury/Arbitrator call

### 3.2 MentorStaking
- `stake(amount)` → Mentor lock USDC, dapat "Verified" badge
- `slash(address, amount)` → Potong stake kalau kalah dispute
- `unstake()` → Timelock 7 hari

### 3.3 ReputationRegistry
- `issueCredential(mentor, sessionId, rating)` → SBT (Soulbound Token) non-transferable
- `getReputation(address)` → Array credentials untuk export

### 3.4 VideoAccess (Hybrid Storage)
- `registerVideo(contentHash, price)` → Simpan hash on-chain, video di Cloudflare
- `purchaseAccess(videoId)` → Bayar USDC, dapat akses
- `hasAccess(learner, videoId)` → Check on-chain

**Deployment:** Arbitrum One (Chain ID 42161), USDC native contract: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  walletAddress String    @unique
  role          Role      @default(LEARNER)
  name          String?
  avatarUrl     String?
  stakeAmount   Decimal   @default(0)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())

  sessionsAsLearner Session[] @relation("LearnerSessions")
  sessionsAsMentor    Session[] @relation("MentorSessions")
  videos          Video[]
  disputes        Dispute[]
}

enum Role {
  LEARNER
  MENTOR
  ADMIN
}

model Session {
  id            String    @id @default(uuid())
  onChainId     BigInt    @unique // Session ID di smart contract
  learnerId     String
  mentorId      String
  status        SessionStatus @default(CREATED)
  tokenAddress  String    // USDC address
  totalAmount   Decimal
  txHashCreate  String?
  txHashRelease String?
  createdAt     DateTime  @default(now())

  learner User @relation("LearnerSessions", fields: [learnerId], references: [id])
  mentor  User @relation("MentorSessions", fields: [mentorId], references: [id])
  milestones Milestone[]
  dispute   Dispute?
}

enum SessionStatus {
  CREATED
  FUNDED
  IN_SESSION
  COMPLETED
  DISPUTED
  RESOLVED
  CANCELLED
}

model Milestone {
  id          String   @id @default(uuid())
  sessionId   String
  index       Int
  title       String
  amount      Decimal
  deadline    DateTime
  status      MilestoneStatus @default(LOCKED)
  evidenceUrl String? // IPFS hash

  session Session @relation(fields: [sessionId], references: [id])
}

enum MilestoneStatus {
  LOCKED
  RELEASED
  DISPUTED
  REFUNDED
}

model Video {
  id            String   @id @default(uuid())
  mentorId      String
  title         String
  description   String?
  cloudflareId  String   // Cloudflare Stream ID
  contentHash   String   // SHA-256 (on-chain proof)
  priceUsdc     Decimal  @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  mentor    User    @relation(fields: [mentorId], references: [id])
  purchases VideoPurchase[]
}

model VideoPurchase {
  id        String   @id @default(uuid())
  videoId   String
  learnerId String
  txHash    String
  createdAt DateTime @default(now())

  video Video @relation(fields: [videoId], references: [id])
  learner User  @relation(fields: [learnerId], references: [id])

  @@unique([videoId, learnerId])
}

model Dispute {
  id            String   @id @default(uuid())
  sessionId     String   @unique
  raisedById    String
  reason        String
  evidenceHash  String   // IPFS hash
  status        DisputeStatus @default(OPEN)
  resolution    String?
  resolvedAt    DateTime?

  session  Session @relation(fields: [sessionId], references: [id])
  raisedBy User    @relation(fields: [raisedById], references: [id])
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
}
```

---

## 5. API Endpoints

### 5.1 Auth
```
POST /auth/nonce
  → Generate random nonce untuk SIWE

POST /auth/verify
  → Verify signature, return JWT + user data

GET /auth/me
  → Return current user (dari JWT)
```

### 5.2 Users
```
GET /users/:address
  → Profile user + reputation summary + stake status

POST /users/onboarding
  → Update profile (name, avatar, role)

POST /users/stake
  → Stake USDC jadi verified mentor (tx confirmation dari frontend)
```

### 5.3 Sessions (Escrow)
```
POST /sessions
  Body: { mentorAddress, milestones: [{title, amount, deadline}], totalAmount }
  → Return unsigned tx data untuk createSession di smart contract

POST /sessions/:id/confirm-tx
  Body: { txHash }
  → Verify tx on-chain, update DB status → FUNDED

GET /sessions/:id
  → Detail session + milestones + on-chain status (real-time dari RPC)

GET /sessions?role=learner|mentor
  → List sessions untuk dashboard

POST /sessions/:id/milestones/:index/confirm
  → Trigger confirmMilestone tx

POST /sessions/:id/dispute
  Body: { reason, evidenceFile }
  → Upload evidence ke IPFS → return tx data untuk raiseDispute
```

### 5.4 Videos
```
POST /videos/upload-url
  → Return signed URL untuk upload ke Cloudflare Stream

POST /videos/register
  Body: { cloudflareId, title, description, price, contentHash }
  → Simpan metadata ke DB + register hash ke smart contract

GET /videos?mentor=:address
  → List video dengan access info

GET /videos/:id/stream
  → Check on-chain access → return signed playback URL (expire 1 jam)

POST /videos/:id/purchase
  → Return tx data untuk purchaseAccess
```

### 5.5 Reputation
```
GET /reputation/:address
  → Aggregate on-chain credentials + review stats

GET /reputation/:address/export
  → Generate JSON-LD Verifiable Credential (signed)
```

### 5.6 Real-time (WebSocket)
```
WS /ws/sessions/:id
  → Subscribe status updates (FUNDED, RELEASED, DISPUTED)

WS /ws/escrow/:userAddress
  → Subscribe semua escrow activity untuk user
```

---

## 6. Indexer Service

**Purpose:** Sync on-chain events ke PostgreSQL biar frontend tidak perlu query RPC terus.

**Events to index:**
```solidity
event SessionCreated(uint256 indexed sessionId, address learner, address mentor, uint256 totalAmount);
event MilestoneReleased(uint256 indexed sessionId, uint256 index, uint256 amount);
event DisputeRaised(uint256 indexed sessionId, address raisedBy, bytes32 evidenceHash);
event DisputeResolved(uint256 indexed sessionId, uint8 releasePercent);
event VideoRegistered(uint256 indexed videoId, address mentor, bytes32 contentHash);
event VideoPurchased(uint256 indexed videoId, address learner);
```

**Flow:**
1. Backend listen events via `viem` (watchContractEvent)
2. Update DB sesuai event
3. Emit WebSocket ke room terkait
4. Frontend update UI real-time

---

## 7. Video Storage Architecture

**Hybrid: Cloudflare Stream (file) + Arbitrum (hash & access)**

```
1. Upload:
   Mentor → Frontend → Backend /videos/upload-url → Cloudflare Stream
   ↓
   Backend generate SHA-256 hash dari file
   ↓
   Backend call smart contract registerVideo(hash, price)
   ↓
   Simpan metadata ke PostgreSQL

2. Access:
   Learner klik "Play" → Frontend request /videos/:id/stream
   ↓
   Backend check smart contract hasAccess(learner, videoId)
   ↓
   Kalau true → generate signed Cloudflare URL (expire 1 jam)
   ↓
   Return URL ke frontend → video player load
```

**Kenapa bukan IPFS untuk video?**
- IPFS lambat untuk streaming video (buffering)
- Pinning cost mahal untuk file besar
- Cloudflare Stream auto-transcode + adaptive bitrate

**On-chain tetap penting untuk:**
- Proof of content (hash tidak bisa diubah)
- Access control (hanya yang bayar yang bisa nonton)
- Monetisasi (payment langsung ke mentor via smart contract)

---

## 8. Authentication Flow (SIWE)

```
1. Frontend: User connect wallet (wagmi)
2. Frontend: GET /auth/nonce → { nonce: "random-string" }
3. Frontend: signMessage({ message: `SkillBridge Login
Nonce: ${nonce}` })
4. Frontend: POST /auth/verify { signature, address }
5. Backend: Verify signature → find/create user → return JWT
6. Frontend: Store JWT → include di header Authorization: Bearer
```

**Middleware:** Semua protected route verify JWT + check wallet address match.

---

## 9. Error Handling & Security

**Smart Contract:**
- ReentrancyGuard (CEI pattern)
- Pull payment (mentor withdraw, bukan push)
- Deadline per milestone (learner bisa refund kalau mentor no-show > 48 jam)

**Backend:**
- Rate limit: 100 req/min per IP
- Input validation (zod schema)
- File upload: max 100MB, allow mp4/webmov only
- Signed URL expire: 1 jam untuk video, 15 menit untuk evidence upload

**Frontend (Next.js):**
- **HAPUS SEMUA MOCKUP** - ganti dengan React Query ke backend
- Environment variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CONTRACT_ADDRESS
- Error boundary dengan toast notification

---

## 10. Deployment Checklist

**Smart Contract:**
- [ ] Deploy ke Arbitrum One
- [ ] Verify source code di Arbiscan
- [ ] Set initial platform fee (5%)
- [ ] Whitelist USDC contract

**Backend:**
- [ ] Deploy ke Railway/Render/Fly.io
- [ ] Setup PostgreSQL (Neon/Supabase)
- [ ] Setup Redis untuk session cache (optional)
- [ ] Setup Cloudflare Stream account
- [ ] Setup IPFS pinning (Pinata/Web3.Storage)

**Frontend:**
- [ ] Ganti semua mockup data dengan API calls
- [ ] Setup wagmi config ke Arbitrum One
- [ ] Deploy ke Vercel

---

## 11. TODO untuk AI Agent

### Phase 1: Cleanup (Wajib Pertama)
- [ ] Hapus semua file `mockData.ts`, `dummyData.json`, atau constant data di frontend
- [ ] Hapus semua `setTimeout` simulasi loading
- [ ] Hapus comment `// TODO: connect to backend`

### Phase 2: Smart Contracts
- [ ] Implement EscrowRouter.sol dengan state machine lengkap
- [ ] Implement MentorStaking.sol dengan slashing
- [ ] Implement VideoAccess.sol untuk hybrid storage
- [ ] Deploy ke Arbitrum Sepolia untuk testing

### Phase 3: Backend
- [ ] Setup Hono/Fastify project dengan Prisma
- [ ] Implement semua endpoint di section 5
- [ ] Setup indexer untuk sync events
- [ ] Implement SIWE auth

### Phase 4: Integration
- [ ] Frontend: ganti mockup dengan React Query mutations
- [ ] Frontend: setup WebSocket listener untuk real-time escrow updates
- [ ] Frontend: video player integrasi dengan Cloudflare Stream

### Phase 5: SaaS Features
- [ ] Subscription model: recurring payment via Superfluid atau Stripe crypto
- [ ] Revenue share: platform fee 5% auto-split saat release escrow
- [ ] Analytics dashboard untuk mentor (earnings, session count)

---

**Deadline: 12 Oktober 2026. Target: Production-ready demo di Arbitrum One Mainnet.**
