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

## 3. Smart Contract Architecture (Arbitrum Sepolia V2 Live)

### 3.1 EscrowRouter V2 (`0x22f3aa08A15d24f7D274b33A234d96EDC5A98E88`)
**State Machine:**
```
0: CREATED → 1: FUNDED → 2: IN_SESSION → 3: COMPLETED
                    ↘ 4: DISPUTED → 5: RESOLVED
```

**Key Functions:**
- `createSession(mentor, milestones[])` → Learner deposit USDC + 10% protocol fee
- `createSessionWithSkill(mentor, milestones[], skillTag)` → Session dengan tagging ke SkillGraph
- `confirmMilestone(sessionId, index)` → Release dana milestone langsung ke mentor
- `raiseDispute(sessionId, evidenceHash)` → Freeze sisa dana & lempar ke DisputeCouncil
- `resolveDispute(sessionId, releasePercent)` → Dieksekusi otomatis oleh DisputeCouncil setelah kuorum juri

### 3.2 VerifiableCredential V2 (`0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D`)
- Dual-party issuance (`issueCompositeCredential`) menerbitkan kredensial untuk learner dan mentor sekaligus
- EIP-712 typed signature digest untuk verifikasi off-chain tanpa gas
- Format ekspor W3C JSON-LD portable (`/certificate/[id]`)

### 3.3 SkillGraph (`0x99303483484cc2c9393138574969f15C415A3016`)
- Graf kompetensi on-chain berlevel (Level 1, 2, 3)
- Validasi prasyarat (*prerequisite gating*, misal: Solidity Basics sebelum Solidity Security)
- Auto-update progress saat credential diterbitkan

### 3.4 DisputeCouncil (`0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006`)
- Dynamic On-Chain Sortition Engine: Memilih 5 juri secara acak dari `jurorPool` per kasus menggunakan `block.prevrandao` & `caseId`
- Conflict of Interest Filter: Murid dan mentor yang bersengketa otomatis di-exclude dari panel juri
- Multi-sig jury panel (5 juri terpilih, kuorum 3-of-5)
- Batas waktu penyelesaian 72 jam, auto-resolusi 50/50 jika juri melewati batas waktu
- Bukti IPFS publik (`evidenceIpfsCid`) tercatat on-chain
- Hook interface untuk eskalasi ke Kleros Court & UMA Optimistic Oracle (Phase 2.0)

### 3.5 MentorStaking (`0xbbD3dA628360c63f36c9E6D2A955e33ADc5281Dd`)
- On-chain Tier Enum: `enum Tier { NONE, PRO, MASTER }` terverifikasi di level smart contract
- `stake(amount)` → Lock minimal 100 USDC (PRO Tier & Verified badge), 300 USDC (MASTER Tier)
- `slash(address, amount, recipient)` → Dipotong otomatis oleh EscrowRouter jika kalah dispute, tier diturunkan otomatis
- `requestUnstake()` → Reset tier/verified seketika, mengaktifkan timelock unbonding 7 hari
- `unstake()` → Tarik kembali pokok stake setelah masa timelock selesai

### 3.6 VideoAccess (`0xb7d6EE04514AB9A210fDa4A3006c230EEEc40023`)
- `registerVideo(contentHash, price)` → Simpan hash on-chain, video streaming HLS di Cloudflare
- `purchaseAccess(videoId)` → Bayar USDC via smart contract, akses dibuka permanen

**Live Network:** Arbitrum Sepolia (`Chain ID: 421614`), USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

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

## 10. Deployment Checklist & Live Status

**Smart Contract (Arbitrum Sepolia Testnet — Live):**
- [x] Deploy ke Arbitrum Sepolia (`EscrowRouter`: `0x14BBB05C74fBcD2E122E197FD244b54dFb171587`)
- [x] Set platform fee ke 10% (`PLATFORM_FEE_BPS = 1000`)
- [x] Hubungkan permissions dengan `ReputationRegistry` (`0xE04Ca75db5020D3F2C48b0a921CB93419BE53A0E`) & `MentorStaking` (`0x6d34056576d76835CC3e0bB8F372C2EB4A7D324b`)
- [x] Arbitrum Sepolia USDC Integration (`0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`)
- [ ] Deploy & Verify ke Arbitrum One Mainnet

**Backend:**
- [x] Hono edge API router di Next.js App Router (`app/api/[[...route]]/route.js`)
- [x] Prisma ORM setup & SQLite development database
- [x] Gas Paymaster Relayer engine (`lib/gasSponsor.js`)
- [x] Multi-chain switcher engine (`lib/networkConfig.js`)

**Frontend:**
- [x] Real Web3 MetaMask integration (tanpa mockup/timer palsu)
- [x] Live balance query (USDC & ETH) dari MetaMask
- [x] Pre-flight insufficient balance warning banner & dynamic button state
- [x] 100% English Web UI across all views

---

## 11. TODO & Milestone Status

### Phase 1: Cleanup & No Mockups
- [x] Eliminasi timer dummy/palsu pada booking checkout
- [x] Transaksi real Web3 MetaMask dengan Arbitrum Sepolia
- [x] Purge database dari session mockup lama

### Phase 2: Smart Contracts
- [x] Implementasi EscrowRouter.sol dengan 10% Protocol Cut (1,000 BPS)
- [x] Implementasi MentorStaking.sol dengan slashing
- [x] Implementasi VideoAccess.sol untuk hybrid access gating
- [x] Implementasi ReputationRegistry.sol untuk Soulbound Token (SBT)
- [x] Deploy resmi ke Arbitrum Sepolia

### Phase 3: Backend & Database
- [x] Setup Hono API router terpadu
- [x] Prisma schema untuk Users, Sessions, Milestones, Videos, Portfolios
- [x] Gas Paymaster relayer untuk penerbitan sertifikat gasless

### Phase 4: Integration
- [x] Booking page real Web3 deposit pipeline (`approve` + `createSession`)
- [x] Live balance detection & faucet shortcuts (Circle USDC & Sepolia ETH)
- [x] Arbiscan transaction receipt confirmation modal

---

**Deadline: 12 Oktober 2026. Target: Production-ready demo di Arbitrum One Mainnet.**
