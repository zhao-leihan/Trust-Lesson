# Feature Spec: Post-purchase classroom, scheduling, quotas, notifications, auto-generated meeting rooms

You are working in the Trust Lesson repo (Next.js 15 App Router, Hono API mounted in
`app/api/[[...route]]/route.js`, Prisma + NeonDB Postgres, Ponder indexer, viem/ethers, JWT via jose).
Inspect the repo first and follow its existing conventions. Do not assume file names from this document.

## 0. Working rules

1. **Phase 0 is audit only.** Before writing code, report what already exists (see section 13) and wait for my approval before any schema migration.
2. **No mock data.** Every screen you touch must read real data from the database. Empty states, never fake rows. Seed data is allowed only behind `NODE_ENV !== "production"` and must be clearly labeled as demo.
3. **Server-side authorization on every endpoint.** Never trust the client for ownership, payment status, or quota.
4. **Do not mark a phase done** until its tests in section 12 pass. Report PASS / FAIL / PARTIAL per acceptance item, with file paths.
5. If a requirement is ambiguous or blocked by an external dependency (OAuth approval, vendor limits), do not silently work around it. State it in the report and implement the fallback described here.
6. **Part B (sections 15-21)** adds data placement rules (on-chain vs Pinata/IPFS vs database vs object storage), chat, and tasks. Read both parts fully before Phase 0; the audit and the final report must cover both.

## 1. Requirements and how to interpret them

| Requirement (from product owner) | Interpretation to implement |
|---|---|
| After the transaction, the class appears for the learner; clicking it shows all materials | After escrow reaches FUNDED, an `Enrollment` appears in the learner's "My Classes". Class detail shows every module and resource, gated by escrow status. |
| Learner books a meeting and picks date and time on a dedicated page | `/schedule` page: pick a date, see only real free slots, choose platform, add an agenda note, submit a request. |
| Mentor can also click to meet and set a date | Either side can propose a time. The other side accepts, declines, or counter-proposes. |
| Quota limit per package | Each package has a structured number of live sessions. Learner can never book beyond it. |
| Mentor sees gigs and which package every learner bought | Mentor gig page has a "Buyers" table with package, status, quota usage, next meeting. |
| One notification place, e.g. when a learner sends a meeting request | In-app notification center with unread badge. |
| Auto-generate meeting rooms for Google Meet and Zoom | Provider abstraction with Google Meet, Zoom, and manual-link fallback. |
| Challenge: an algorithm so learners can Google Meet together | Two parts, both required: (a) conflict-free slot finder for mentor + learner; (b) group sessions where several learners join one room, plus a matching algorithm that picks the slot with the most learners available. See section 5. |
| "Don't use mockups, take it from real feedback" | Interpreted as: no hardcoded testimonials, ratings, or counts anywhere. Ratings and reviews come only from real post-session learner feedback. See section 10. If this interpretation is wrong, say so in the Phase 0 report. |

## 2. Access rules (escrow gate)

Read escrow status through one function, `getEnrollmentAccess(enrollmentId, userId)`. Source of truth is on-chain; the Ponder/DB copy is allowed only if its freshness is checked. For sensitive actions (reveal join link, create room, issue signed content URL) re-confirm on-chain if the indexed state is older than 60 seconds.

Defaults (make them constants, report them):

| Escrow status | Materials | Request meeting | See join link of accepted meeting |
|---|---|---|---|
| CREATED | no | no | no |
| FUNDED | yes | yes | yes |
| IN_SESSION | yes | yes | yes |
| COMPLETED | yes (read only) | no | no |
| DISPUTED | yes (read only) | no | no (freeze) |
| CANCELLED / RESOLVED | no | no | no |

A user may only access an enrollment if they are its learner or its mentor. Return 404, not 403, for other people's IDs.

## 3. Data model (Prisma, adapt to existing schema)

Store all instants as UTC `timestamptz`. Store mentor timezone as an IANA string.

- **Package**: replace free text such as "3 Live Meeting" with structured fields `liveSessionsIncluded Int`, `sessionDurationMin Int`, `validityDays Int?`. Write a migration that parses existing text where possible and lists rows it could not parse. Self-paced packages have `liveSessionsIncluded = 0` and must hide all scheduling UI.
- **Enrollment**: `id`, `gigId`, `packageId`, `learnerId`, `mentorId`, `onchainSessionId` (unique), `escrowStatus` (mirror enum), `sessionsIncluded`, `sessionDurationMin` (copied from package at purchase time), `sessionsReserved Int @default(0)`, `sessionsUsed Int @default(0)`, `expiresAt?`. Indexes on `learnerId` and `(mentorId, gigId)`. Created from the escrow event (`SessionFunded`), idempotently.
- **MentorAvailabilitySettings**: `mentorId`, `timezone`, `minNoticeHours`, `maxHorizonDays`, `bufferBeforeMin`, `bufferAfterMin`, `slotStepMin`, `maxSessionsPerDay`.
- **AvailabilityRule**: `mentorId`, `weekday 0-6`, `startMinute`, `endMinute` (local to mentor timezone).
- **AvailabilityException**: `mentorId`, `startAt`, `endAt`, `kind BLOCK | EXTRA`, `note`.
- **Meeting**: `id`, `mentorId`, `gigId`, `kind ONE_TO_ONE | GROUP`, `startAt`, `endAt`, `status`, `platform GOOGLE_MEET | ZOOM | MANUAL`, `roomStatus NONE | PENDING | READY | FAILED`, `joinUrl?`, `hostUrlEnc?`, `externalId?`, `requestedByRole LEARNER | MENTOR`, `agenda?`, `capacity?`, `minParticipants?`, `supersedesMeetingId?`.
  Status enum: `PENDING, ACCEPTED, DECLINED, SUPERSEDED, CANCELLED_BY_LEARNER, CANCELLED_BY_MENTOR, EXPIRED, COMPLETED, NO_SHOW_LEARNER, NO_SHOW_MENTOR`.
- **MeetingParticipant**: `meetingId`, `enrollmentId`, `status JOINED | WAITLIST | CANCELLED`, `quotaState RESERVED | USED | RELEASED | FORFEITED`. A 1:1 meeting has exactly one participant, so 1:1 and group share one code path.
- **QuotaLedger**: append-only audit of every reserve / release / consume / forfeit with `enrollmentId`, `meetingId`, `reason`, `createdAt`.
- **Notification**: `id`, `userId`, `type`, `payload Json`, `dedupeKey` (unique), `readAt?`, `createdAt`. Index `(userId, readAt, createdAt desc)`.
- **CalendarConnection**: `userId`, `provider`, `accountEmail`, `accessTokenEnc`, `refreshTokenEnc`, `expiresAt`, `scopes`, `status ACTIVE | EXPIRED | REVOKED`.
- **Review**: `enrollmentId` (unique), `learnerId`, `mentorId`, `gigId`, `rating 1-5`, `comment?`, `createdAt`.
- **LearnerAvailabilityWindow** (for group matching): `learnerId`, `enrollmentId`, `startAt`, `endAt`.

**Double-booking protection at the database level** (raw SQL migration, Prisma cannot express it). Verify `btree_gist` is available on NeonDB and adapt column types:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Meeting" ADD CONSTRAINT meeting_no_mentor_overlap
  EXCLUDE USING gist ("mentorId" WITH =, tstzrange("startAt", "endAt", '[)') WITH &&)
  WHERE ("status" IN ('PENDING', 'ACCEPTED'));
```

This is the last line of defense. Application checks come first.

## 4. Quota rules

A learner's available quota is `sessionsIncluded - sessionsUsed - sessionsReserved`.

| Event | Quota effect |
|---|---|
| Request created (PENDING) | Reserve 1. Fail with `409 QUOTA_EXCEEDED` if none left. |
| Mentor accepts | No change. |
| Mentor declines, request expires, mentor cancels | Release 1. |
| Learner cancels at least 24h before start | Release 1. |
| Learner cancels less than 24h before start | Forfeit (counts as used). |
| Meeting ends and is not disputed | Reserved becomes used. |
| Learner no-show | Used. |
| Mentor no-show | Release 1 and flag the meeting as dispute evidence. |
| Counter-proposal | The new meeting inherits the same reserved unit. Never reserve twice. |

Reservation must be atomic and race-free:

```sql
UPDATE "Enrollment"
SET "sessionsReserved" = "sessionsReserved" + 1
WHERE id = $1 AND "sessionsUsed" + "sessionsReserved" < "sessionsIncluded"
RETURNING *;
```

Zero rows returned means `QUOTA_EXCEEDED`. Every change writes a `QuotaLedger` row in the same transaction. Counters must never go negative or exceed the limit under concurrency. `PENDING` requests expire after 48h or 6h before `startAt`, whichever is earlier (scheduled job).

## 5. Scheduling algorithms

### 5.1 Slot generation (mentor + one learner)

Inputs: mentor, `durationMin`, `from`, `to`. Use a timezone-safe library (Luxon or equivalent) so DST never shifts a slot.

```
function generateSlots(mentor, durationMin, from, to):
  windows = expandWeeklyRules(mentor.rules, mentor.timezone, from, to)   // UTC intervals
  windows = applyExceptions(windows, mentor.exceptions)                  // BLOCK subtracts, EXTRA adds
  busy    = activeMeetings(mentor, from - buffer, to + buffer)
              .map(m => [m.start - bufferBefore, m.end + bufferAfter])
  // optional: add external busy times from Google freeBusy when connected
  free    = subtractIntervals(mergeSorted(windows), mergeSorted(busy))
  clip free to [now + minNotice, now + maxHorizon]
  slots = []
  for interval in free:
    for t = ceilToStep(interval.start, step); t + durationMin <= interval.end; t += step:
      slots.push({ start: t, end: t + durationMin })
  drop slots on days where mentor already has maxSessionsPerDay (counted in mentor timezone)
  return slots
```

Complexity is O((R + B) log (R + B) + S). Return slots in UTC and let the client render the viewer's timezone. Always label the timezone on screen, and show the mentor's local time too.

### 5.2 Booking transaction (race-safe)

```
BEGIN
  pg_advisory_xact_lock(hashtext('mentor:' || mentorId))
  assert getEnrollmentAccess allows scheduling
  assert package.liveSessionsIncluded > 0 and enrollment not expired
  assert requested slot is inside generateSlots(...) for a narrow range
  assert learner has no overlapping active meeting
  reserve quota atomically (section 4)
  INSERT Meeting, INSERT MeetingParticipant
  INSERT Notification for the other side (dedupeKey)
COMMIT
```

On exclusion-constraint or uniqueness violation return `409 SLOT_TAKEN` together with fresh slots. Support an `Idempotency-Key` header on creation so double clicks do not create duplicates.

### 5.3 Counter-proposals

A counter-proposal creates a new `PENDING` meeting with `supersedesMeetingId`. The original becomes `SUPERSEDED` and leaves the exclusion constraint. If the counter is declined or expires, both close and the quota unit is released. Limit to 3 rounds per request.

### 5.4 Group sessions: learners meet together

**(a) Published group slot.** Mentor creates a `GROUP` meeting with `capacity`, `minParticipants`, and eligible packages. One room is created up front. Learners with remaining quota and an eligible package can join:
- Joining locks the meeting row (`SELECT ... FOR UPDATE`), checks capacity, inserts a participant, reserves quota, all in one transaction.
- Full means `WAITLIST` (FIFO). On cancellation, promote the first waitlisted learner who still has quota and notify them.
- If participants are below `minParticipants` at 24h before start, auto-cancel, release every quota unit, and notify everyone.
- A learner cannot join two overlapping meetings.

**(b) Demand-driven matching (the algorithm challenge).** Learners submit preferred windows. Pick the slot where the most learners can attend:

```
function proposeGroupSlot(mentorFreeSlots, learnerWindows, minSize, maxSize):
  best = null
  for slot in mentorFreeSlots:
    available = learners L where some window w in L.windows has
                w.start <= slot.start and slot.end <= w.end
                and L has remaining quota
    if |available| < minSize: continue
    score = min(|available|, maxSize)
    if best is null or score > best.score
       or (score == best.score and slot.start < best.slot.start):
      best = { slot, available, score }
  if best is null: return nearest partial match (largest group below minSize) and suggest widening windows
  participants = pick up to maxSize from best.available, ordered by earliest request first,
                 then by soonest package expiry
  return { slot: best.slot, participants }
```

Keep each learner's windows sorted and use binary search per slot, so cost is O(S · L · log W). Return the chosen slot as a proposal that the mentor confirms; do not auto-create meetings without mentor confirmation.

## 6. Meeting room generation

Define one interface and three implementations:

```ts
interface MeetingProvider {
  createRoom(input): Promise<{ joinUrl: string; hostUrl?: string; externalId: string }>
  updateRoom(externalId, input): Promise<void>
  cancelRoom(externalId): Promise<void>
}
```

**GoogleMeetProvider**
- Call Calendar API `events.insert` with query parameter `conferenceDataVersion=1` and body `conferenceData.createRequest = { requestId: <meeting.id>, conferenceSolutionKey: { type: "hangoutsMeet" } }`. Without `conferenceDataVersion=1` the conference data is silently ignored.
- Create a **new** conference for every meeting. Google advises against reusing Meet codes across events.
- Save the event id as `externalId` and the Meet link from `conferenceData.entryPoints` (or `hangoutLink`) as `joinUrl`. Use `events.patch` / `events.delete` to update or cancel.
- Auth: per-mentor OAuth, scope `https://www.googleapis.com/auth/calendar.events`, offline access. Add learner email as attendee only if the learner provided one (wallet-only users may have none; the in-app join button is enough).
- Verify with a plain personal Gmail account during development and report whether it works.

**ZoomProvider**
- Per-mentor OAuth (user-managed app). Create meetings with `POST /v2/users/me/meetings`: `type: 2`, `start_time` in UTC, `duration`, `timezone`, settings with waiting room on and join-before-host off.
- `join_url` goes to the learner. `start_url` is host-only: store encrypted, never send to a learner, never log it.
- **Known blocker:** an unpublished Zoom OAuth app can only be authorized by users inside the developer's own Zoom account; letting any mentor connect requires publishing the app (Zoom review). For the hackathon implement the provider, plus an opt-in `ZOOM_PLATFORM_MODE` where the platform's own Zoom account hosts meetings. Document its concurrency limit (one license = one meeting at a time) and refuse to create overlapping platform-hosted meetings.

**ManualLinkProvider (fallback, must work first)**
- Mentor stores a permanent room link (the gig wizard already has a "Meeting Room / Invite Link" field). Use it when no OAuth connection exists or room creation fails.

**Reliability**
- Creating a meeting commits the row with `roomStatus = PENDING`. A background job then creates the room, idempotent by `requestId = meeting.id`. Retry 3 times with exponential backoff, then set `FAILED`, notify the mentor, and fall back to the manual link.
- If the room is created but the DB update fails, delete the external event (compensation).
- Wrap provider calls in timeouts. Encrypt all OAuth tokens at rest (AES-256-GCM, key from env or KMS). Handle `invalid_grant` by marking the connection `EXPIRED`, notifying the mentor, and falling back.
- **Google OAuth blocker:** while the consent screen is in Testing, only listed test users can connect and refresh tokens expire after about 7 days; production use of the calendar scope needs Google verification. Build a clear "reconnect" flow and document this in the report.
- Reveal `joinUrl` only inside the join window (15 minutes before start until 30 minutes after end) and only when escrow access allows it. The API returns `canJoinNow`.

## 7. Notifications

In-app first. Poll `GET /api/notifications?since=` every 20-30 seconds, with an unread-count endpoint driving the bell badge. Keep delivery behind an interface so SSE or email (e.g. Resend) can be added later; email stays off by default.

| Event | Recipient |
|---|---|
| NEW_ENROLLMENT (learner bought a package) | mentor |
| MEETING_REQUESTED | the other side |
| MEETING_ACCEPTED / DECLINED / COUNTER_PROPOSED / CANCELLED | requester |
| ROOM_READY / ROOM_FAILED | both / mentor |
| MEETING_REMINDER_24H, MEETING_REMINDER_15M | both |
| QUOTA_LOW (1 left), QUOTA_EXHAUSTED | learner |
| GROUP_WAITLIST_PROMOTED, GROUP_CANCELLED_BELOW_MIN | learner |
| REVIEW_REQUESTED | learner |

Reminders and request expiry run from a secured cron endpoint (`CRON_SECRET`), idempotent through `dedupeKey = type:meetingId:userId`.

## 8. Screens

**Learner**
- `/dashboard/classes`: list of the learner's enrollments from the database.
- `/dashboard/classes/[enrollmentId]`: gig, mentor, package, escrow status; quota meter ("2 of 5 used, 1 reserved"); **Materials** (modules in order, video through the signed playback-token endpoint, documents through the signed download endpoint, lock state with reason when escrow disallows); **Meetings** (upcoming and past, join button, cancel); "Request meeting" button disabled with a visible reason when quota is exhausted or status disallows.
- `/dashboard/classes/[enrollmentId]/schedule`: date picker, real slots, timezone label, platform choice (only providers the mentor enabled), agenda, optional email, submit. On `SLOT_TAKEN` refresh the slots without losing the form.

**Mentor**
- `/dashboard/gigs/[gigId]`: **Buyers** table: learner, package tier, purchased at, escrow status, quota used/reserved/total, next meeting, last activity. Filters and sorting.
- `/dashboard/requests`: inbox with accept, decline, counter-propose.
- `/dashboard/availability`: weekly rules, exceptions, settings, provider connections (connect, disconnect, test room), manual link.
- Group sessions: create and manage; matching suggestions from 5.4(b).

**Shared**: notification bell and `/dashboard/notifications`.

## 9. API surface (names are suggestions; match the repo's style)

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/enrollments` | learner / mentor | own only |
| GET | `/enrollments/:id` | participant | includes quota and access state |
| GET | `/gigs/:id/buyers` | gig mentor | pagination |
| GET | `/mentors/:id/slots?durationMin&from&to` | enrolled learner | respects section 2 |
| POST | `/enrollments/:id/meetings` | learner | `Idempotency-Key` required |
| POST | `/mentors/me/meetings` | mentor | mentor-initiated proposal |
| POST | `/meetings/:id/accept` `/decline` `/counter` `/cancel` | participant | state-machine checked |
| POST | `/meetings/:id/complete`, `/no-show` | mentor / learner | feeds quota and dispute evidence |
| GET | `/meetings/:id/join` | participant | returns `joinUrl` only inside the window |
| POST | `/group-sessions`, `/group-sessions/:id/join`, `/group-sessions/:id/leave` | mentor / learner | capacity and quota in one transaction |
| POST | `/group-sessions/propose` | mentor | runs 5.4(b) |
| GET/PUT | `/mentors/me/availability` | mentor | rules, exceptions, settings |
| GET/POST/DELETE | `/connections/google`, `/connections/zoom` | mentor | OAuth start, callback, revoke |
| GET | `/notifications`, POST `/notifications/:id/read`, `/notifications/read-all` | user | |
| POST | `/enrollments/:id/review` | learner | see section 10 |
| POST | `/internal/cron/reminders` | cron | secret-protected |

Validate every body with zod. Rate limit meeting creation (for example max 5 PENDING requests per enrollment and 20 requests per hour per user).

## 10. Real data and feedback rules

- Remove or replace every hardcoded testimonial, rating, learner count, or "verified member" element on the landing page and elsewhere. If there are no real reviews, render no review section at all.
- Ratings come only from `Review` rows. A learner may review only after at least one meeting is `COMPLETED` or the escrow is `COMPLETED`, once per enrollment. Mentor rating is `null` until the first review (already required earlier); aggregate from the database, never from constants.
- Counts shown publicly (mentors, sessions, learners) are computed from the database or removed.
- Marketing copy must match the product: the protocol fee is 10% paid by the learner on top; mentors keep 100% of their rate. Fix any text that says otherwise (for example "5%").
- Demo seeds, if any, are dev-only and labeled "Demo".

## 11. Security and privacy

- Authorization checks on enrollment, meeting, and notification ownership in every handler; test that user A cannot read user B's data.
- OAuth tokens and Zoom `start_url` encrypted at rest and never returned by any API or written to logs.
- Join links and materials are never in HTML or JSON for unpaid or out-of-window requests.
- Validate all dates server-side, reject past times and anything outside the generated slots.
- Do not expose learner email to mentor beyond what the learner provided for the meeting.

## 12. Tests and acceptance criteria

Automated tests (or a documented manual script where a vendor API cannot be tested automatically; mock providers in unit tests):

1. Slot generator: weekly rules, exceptions, buffers, min notice, max horizon, per-day cap, DST boundary in a non-Indonesian timezone, interval subtraction edge cases.
2. Race: 20 parallel booking requests for the same slot produce exactly one success and 19 `SLOT_TAKEN`; the exclusion constraint alone blocks a direct insert that bypasses the application check.
3. Quota: parallel requests never exceed `sessionsIncluded`; release, forfeit, and consume follow the table in section 4; counters never go negative; the ledger reconciles with counters.
4. Access: unpaid, CREATED, DISPUTED, CANCELLED enrollments cannot see materials, request meetings, or fetch join links as defined in section 2; learner A cannot read learner B's enrollment.
5. Providers (mocked): idempotent room creation, retry then `FAILED` then manual fallback, compensation on DB failure, `start_url` never present in learner responses.
6. Notifications: created once per event (dedupe), unread count correct, reminders fire once.
7. Group: capacity under concurrency, FIFO waitlist promotion, auto-cancel below minimum with full quota release, overlapping-meeting rejection.
8. Matching: returns the slot with maximum coverage; tie-break is earliest slot; returns nearest partial when no slot reaches `minSize`.
9. Reviews: only after completion, once per enrollment, aggregate rating null with zero reviews.
10. No hardcoded testimonials, ratings, or counts remain (search the codebase and list what you removed).

## 13. Delivery phases

- **Phase 0 (audit, no code changes):** report the current state of: enrollment creation after purchase, package fields (how "3 Live Meeting" is stored), where meeting links are stored, existing notification code, how escrow status is read (on-chain vs indexer, and its freshness), existing OAuth/session setup, and every place with mock or hardcoded data. Propose the migration plan. Wait for approval.
- **Phase 1:** structured package fields, `Enrollment` creation from the escrow event, My Classes list and class detail with gated materials, mentor Buyers table.
- **Phase 2:** availability settings, slot generator, booking transaction, quota engine, manual-link provider, requests inbox, accept/decline/counter/cancel.
- **Phase 3:** notification center and cron jobs (reminders, expiry).
- **Phase 4:** Google Meet provider, then Zoom provider, with connection management and the fallbacks in section 6.
- **Phase 5:** group sessions and the matching algorithm.
- **Phase 6:** reviews, real-data cleanup, security pass.
- **Phases 7-12:** chat, tasks, anchoring, evidence bundles. See section 21. The final report comes after the last phase you were approved to build.

## 14. Report back with

- PASS / FAIL / PARTIAL for each acceptance item, with file paths.
- The chosen constants (cancellation window, join window, expiry rules, access table) and why.
- Whether escrow status is read on-chain or from the indexer, and the staleness guard used.
- Which provider paths were actually tested end to end and which are only mocked.
- Every external blocker hit (Google testing-mode limits, Zoom publication requirement, NeonDB extension support) and the fallback in use.
- Anything you did not implement, and why.

---

# PART B: Data placement, chat, and tasks (extension)

Part B extends sections 1-14. Where they conflict, Part B wins. Everything in Part B must respect the access rules in section 2 and the "no mock data" rule.

## 15. Data placement: on-chain vs Pinata/IPFS vs database vs object storage

### 15.1 Decision rules (first match wins)

1. Moves money, decides who is paid or slashed, or grants a right that a third party must be able to verify without trusting us: **on-chain**.
2. Must be an immutable, third-party-verifiable record of a payload at a point in time (evidence, credential metadata): **Pinata/IPFS payload, with its hash or CID referenced on-chain or anchored**.
3. Mutable, private, high-frequency, relational, or must be deletable: **database**.
4. Large binary (video, documents, attachments): **Cloudflare Stream / R2 with signed URLs**. Never public IPFS.
5. Secrets (OAuth tokens, encryption keys, Zoom `start_url`): **encrypted in the database or KMS**. Never on-chain, never on IPFS.

### 15.2 Placement matrix

| Item | On-chain | Pinata / IPFS | Database | Object storage |
|---|---|---|---|---|
| Escrow funds, protocol fee, milestone release | `EscrowRouter` (source of truth) | no | indexed mirror | no |
| Session status (FUNDED, IN_SESSION, ...) | `EscrowRouter` | no | `Enrollment.escrowStatus` mirror | no |
| Milestone amounts | set in `createSession` | no | package and deliverable text | no |
| Dispute case, votes, resolution | `DisputeCouncil` | no | case timeline for the UI | no |
| Dispute evidence | CID stored in the case | encrypted bundle (section 18) | `IpfsObject` row | no |
| Mentor stake, tier, slashing | `MentorStaking` | no | indexed mirror | no |
| Juror pool membership | `DisputeCouncil` | no | eligibility stats (sessions, rating) | no |
| Credential (SBT, EIP-712) | `VerifiableCredential` | VC JSON-LD, no PII | cache plus `IpfsObject` row | no |
| Skill levels | `SkillGraph` | no | indexed mirror | no |
| Paid-content access right | `VideoAccess` | no | module records | Stream / R2 files via signed URLs |
| Course videos and documents | hash registration (existing) | no | module metadata | Stream / R2 |
| Availability rules and settings | never | never | yes | no |
| Meetings, participants, room links | never | only inside a dispute bundle | yes | no |
| Quota counters and ledger | never | only inside a dispute bundle | yes (platform-enforced) | no |
| OAuth tokens, Zoom `start_url` | never | never | encrypted | no |
| Notifications | never | never | yes | no |
| Chat messages | never raw | only inside an encrypted dispute bundle | yes, with hash chain | attachments in R2 |
| Chat integrity | daily Merkle root (optional) | no | hashes and leaves | no |
| Task definitions, rubrics, templates | never | never | yes | attachments in R2 |
| Task submissions and reviews | never | final bundle for an approved gate task | yes | submitted files in R2 |
| Task signatures and hashes | inside the daily Merkle root | no | yes | no |
| Review text and aggregate rating | rating value passed to credential issuance | no | comment and aggregates | no |

### 15.3 Hard rules

- Never put PII (name, email, phone), chat plaintext, OAuth tokens, join or host URLs, or drafts on-chain or on public IPFS.
- IPFS content cannot be reliably deleted. Pin only at moments that need immutability (dispute raised, credential issued, final task approved), encrypt anything private first, and record every object in `IpfsObject`. To "delete", destroy the encryption key (crypto-shredding) and unpin. Check Pinata's current plan limits and private-file options, but encrypt regardless.
- **On-chain write budget.** Only these actions may trigger a sponsored transaction: create/fund session, start session, cancel session, confirm milestone, raise dispute, open case, vote, resolve, issue credential, stake, unstake, slash, join juror pool, and one daily Merkle anchor. Chat, tasks, meetings, notifications, quota, and reviews must never send a transaction on their own.
- Add relayer guards: an allow-list of contract functions, per-user and global daily caps, a gas cap per transaction, and an alert when a cap is near. This also protects the sponsor wallet from abuse.
- The database is the source of truth only for off-chain business state. For data it mirrors from the chain (escrow status, stake, tier, jurors) the chain wins on conflict; add a reconciliation job.
- Trust disclosure: quota, scheduling, chat, and tasks are enforced by the platform, not by contracts. UI copy and docs must not call them "on-chain".

### 15.4 Contract changes

None are required. Do not modify or redeploy existing contracts for this feature. Optional, only after my approval (Phase 12), a minimal events-only anchor contract:

```solidity
event RootAnchored(uint64 indexed batchId, bytes32 root, uint64 fromSeq, uint64 toSeq, uint64 at);
function anchorRoot(bytes32 root, uint64 fromSeq, uint64 toSeq) external onlyAnchorer; // emits RootAnchored
```

If it is not deployed, keep anchors in the database with `status = PENDING_CHAIN`. Everything must work without it.

### 15.5 Merkle anchoring

- Leaves are `keccak256(abi.encode(kind, refId, contentHash, seq, timestamp))` for: chat thread head hashes (daily), task submission and approval hashes, meeting attendance records.
- A daily job builds the tree, stores the root and each leaf index, and publishes the root (one transaction per day). `GET /proofs/:leafId` returns the Merkle path. Anyone holding the item plus the path can recompute the root and compare it with the on-chain event.
- State clearly in the UI and docs what this proves (the content existed unchanged at anchor time, so the platform cannot rewrite history unnoticed) and what it does not (who wrote it, unless signed).
- Authorship: task submissions and approvals are signed with EIP-712 by the user's wallet. For custodial email users the platform signs and marks `signedBy = PLATFORM_CUSTODIAL`. Chat messages are not individually signed; their integrity comes from the hash chain (section 16.3).

## 16. Chat

### 16.1 Threads and access

- `DIRECT` thread per enrollment (learner and mentor). `GROUP` thread per group session or cohort. `SYSTEM` messages appear inside these threads.
- Optional pre-purchase question thread behind `PRESALE_CHAT_ENABLED=false`, capped at 3 messages when enabled.

| Escrow status | Chat access |
|---|---|
| CREATED | none |
| FUNDED, IN_SESSION | read and write |
| COMPLETED | read and write for 7 days, then read-only |
| DISPUTED | read-only for the parties, evidence export allowed |
| CANCELLED, RESOLVED | read-only for 30 days, then archived (kept for the evidence retention period, default 180 days) |

### 16.2 Features

- Text with a safe markdown subset, rendered as sanitized output (no raw HTML).
- Attachments through R2 with signed URLs: size limit (25 MB default), type allow-list, sanitized filenames, and a hook for malware scanning.
- Replies, edits (15-minute window, edit history kept), soft delete (tombstone, still part of the hash chain).
- Read receipts and unread counts per thread, shown in the bell and on the class list.
- Typing and presence indicators: ephemeral, never stored.
- System cards that deep-link: meeting requested or accepted, task assigned, submitted, or approved, milestone confirmed, quota low.
- Per-thread full-text search (Postgres), mute, report message into a moderation queue, block user (blocks new messages only, never touches escrow).
- Rate limit (30 messages per minute per user). A soft banner reminds users that payments and sessions kept on Trust Lesson stay protected by escrow. Do not hard-block contact details.

### 16.3 Integrity

Every message gets a monotonic `seq` per thread and `hash = keccak256(prevHash || canonicalJson(message))`. Edits and deletes append new events instead of rewriting history. The thread head hash goes into the daily anchor (section 15.5).

### 16.4 Transport

Define `RealtimeTransport { publish(channel, event); authorize(userId, channel) }`.
- Phase A: database plus polling (`GET /threads/:id/messages?afterSeq`), every 3-5 seconds when a thread is open and every 30 seconds otherwise.
- Phase B: a managed pub/sub service (Ably, Pusher, or an equivalent with a free tier), because serverless Next.js cannot hold WebSocket connections. The channel authorization endpoint must enforce the access table above.
- Realtime is never the source of truth. Clients reconcile by `seq` from the database.

### 16.5 Privacy

Show a notice that messages may be used as evidence in a dispute. Plaintext chat never goes to IPFS on a schedule. Only the evidence builder (section 18) may export a thread, and only when a dispute is raised.

## 17. Tasks (assignments at the start, during, and at the end)

### 17.1 Concepts

A mentor authors `TaskDefinition`s per gig (optionally per package) and can save them as reusable templates. Each definition has a phase:
- `PRE`: intake or diagnostic, assigned automatically when the enrollment becomes FUNDED.
- `DURING`: homework, assigned after session N completes.
- `POST`: final or capstone, assigned after the last session or when the mentor releases it.

Task types: `QUESTIONNAIRE` (structured fields), `FILE_UPLOAD`, `LINK_REPO` (GitHub URL; optionally record the commit SHA via the GitHub API for public repos), `QUIZ` (multiple choice, auto-graded, answer key never sent to the client), `TEXT_REFLECTION`.

Definition fields: title, instructions (markdown), attachments, `dueRule` (absolute date, N days after assignment, N days before session K, or N days after the last session), `latePolicy` (`ALLOW | PENALTY_PERCENT | BLOCK`), `maxAttempts`, `rubric` (criteria with id, label, weight, and level descriptors), `passingScore`, `blocksScheduling` (PRE only: the learner must submit before requesting the first meeting), `linkedMilestoneIndex?`.

Lifecycle: `ASSIGNED, IN_PROGRESS (autosaved draft), SUBMITTED (version n), CHANGES_REQUESTED, APPROVED, REJECTED`, plus `EXCUSED` (mentor) and a derived `OVERDUE`. A resubmission creates a new version and never overwrites the old one.

### 17.2 Review

- The server computes the weighted rubric score. Mentor feedback is per criterion plus an overall comment, and a decision (approve, request changes, reject).
- Mentor dashboard has a "Needs review" queue sorted by oldest first, and a reminder to the mentor after 48 hours without review.
- Peer review for group sessions: a learner reviews another learner's submission with the rubric, with an anonymous option.

### 17.3 Start and end tasks specifically

- **Start task (PRE):** default intake template with goals, experience level, availability, and a baseline diagnostic. The mentor sees it before the first meeting. The baseline score is stored.
- **End task (POST):** capstone with rubric. When APPROVED with score at or above `passingScore`, it triggers the credential evidence bundle (section 18). The final score and the evidence CID go into the credential's JSON-LD `evidence` field. This is metadata only and needs no contract change. Show learner and mentor the baseline-to-final improvement.

### 17.4 Milestone linkage (UI level only)

The deliverable checklist in the gig wizard becomes, or links to, task definitions. The learner's "Confirm milestone" screen shows the status of linked tasks. If they are not approved, show a warning but do not block: the contract cannot be blocked from the UI and the learner may confirm anyway. A mentor can press "Mark milestone delivered" (database flag plus notification) to prompt confirmation. Never auto-confirm a milestone. If an on-chain auto-release timeout is wanted, report it as a future contract change.

### 17.5 Integrity and signing

On `SUBMITTED` compute `contentHash` (canonical JSON plus the list of file SHA-256 values). The learner signs EIP-712 `TaskSubmission(enrollmentId, taskId, version, contentHash, submittedAt)`. On `APPROVED` the mentor signs `TaskApproval(...)`. Store both signatures and add both hashes to the daily anchor. Files stay in private R2 with SHA-256 recorded.

### 17.6 Mentor analytics (real data only)

Per gig: completion rate, average time to submit, average review turnaround, baseline-to-final delta, and an overdue list.

## 18. Evidence bundles (disputes and credentials)

`buildEvidenceBundle(enrollmentId, purpose)` collects:
- meeting records (scheduled times, join times if available, no-show flags),
- task submissions, reviews, signatures, and file hashes,
- the chat thread export with its hash-chain proof,
- the quota ledger and the escrow events.

Output is versioned JSON, encrypted with AES-256-GCM, pinned to Pinata, and its CID saved in `IpfsObject`.
- `purpose = DISPUTE`: the CID is passed to the existing `raiseDispute` / `openCase` evidence field. Use a random data key per bundle, wrapped by a KMS or master key. After juror sortition, re-wrap the key for the five selected jurors and log every access. Both parties also receive the key.
- `purpose = CREDENTIAL`: a small bundle with the final task result and rubric summary, no chat, no PII. The CID is referenced in the credential's JSON-LD `evidence` field.
- Pin only when a dispute is raised or a credential is issued. Never on a schedule.

## 19. Additions to the data model, API, screens, notifications

**Data model**
- `ChatThread(id, kind DIRECT|GROUP, enrollmentId?, meetingId?, createdAt)`, `ChatParticipant(threadId, userId, role, mutedAt?, lastReadSeq)`, `ChatMessage(id, threadId, senderId, seq, kind TEXT|ATTACHMENT|SYSTEM, body, attachments Json, replyToId?, editedAt?, deletedAt?, prevHash, hash, createdAt)`, `ChatReport`.
- `TaskDefinition`, `TaskTemplate`, `TaskAssignment(enrollmentId, definitionId, status, dueAt, attempt)`, `TaskSubmission(assignmentId, version, content Json, fileRefs Json, contentHash, signature, signedBy, submittedAt)`, `TaskReview(submissionId, rubricScores Json, feedback, decision, signature)`.
- `IpfsObject(cid, kind, encrypted, sizeBytes, ownerId, relatedType, relatedId, pinnedAt, unpinnedAt?)`, `AnchorBatch(id, root, fromSeq, toSeq, txHash?, status)`, `AnchorLeaf(batchId, leafIndex, kind, refId, hash)`.

**API (names are suggestions)**
- Chat: `GET /threads`, `GET /threads/:id/messages?afterSeq`, `POST /threads/:id/messages`, `PATCH`/`DELETE /messages/:id`, `POST /threads/:id/read`, `POST /messages/:id/report`, `GET /threads/:id/search?q`, attachment upload and download URLs.
- Tasks: `GET/POST/PATCH /gigs/:id/task-definitions`, template CRUD, `GET /enrollments/:id/tasks`, `PUT /tasks/:assignmentId/draft`, `POST /tasks/:assignmentId/submit`, `POST /submissions/:id/review`, `GET /gigs/:id/review-queue`, `GET /gigs/:id/task-analytics`.
- Proofs: `GET /proofs/:leafId`, `POST /enrollments/:id/evidence-bundle` (dispute or credential only).

**Screens**
- Learner class page gets "Messages" and "Tasks" tabs. Mentor gig page gets "Task builder", "Needs review", and "Messages".

**Notifications to add**
- NEW_MESSAGE (batched when offline), TASK_ASSIGNED, TASK_DUE_SOON, TASK_OVERDUE, TASK_SUBMITTED, TASK_CHANGES_REQUESTED, TASK_APPROVED, REVIEW_OVERDUE (mentor), MILESTONE_DELIVERED.

## 20. Tests for Part B

1. Placement guard: automated check that chat, tasks, meetings, quota, notifications, and reviews never trigger a relayer transaction; the relayer rejects functions outside the allow-list and enforces the caps.
2. No PII, chat plaintext, tokens, or join URLs in any IPFS payload or on-chain call (inspect payloads in tests).
3. Chat: authorization per thread, escrow-status access table, rate limit, attachment limits, hash-chain verification (tampering with one stored message breaks verification), reconcile by `seq` after missed polls.
4. Tasks: rubric score calculation, versioned resubmission, `blocksScheduling` blocks the first meeting request until the PRE task is submitted, late-policy math, quiz answer key never present in learner responses, signature verification for submission and approval.
5. Anchoring: Merkle root and proof verify for a sample of leaves; the daily job is idempotent; works with `PENDING_CHAIN` when no contract is deployed.
6. Evidence bundle: encrypted at rest, decrypts only for authorized parties and selected jurors, access is logged, CID recorded in `IpfsObject`.
7. Credential evidence: final approved task produces a VC `evidence` entry with score and CID, with no PII.

## 21. Delivery phases for Part B

Part B extends the Phase 0 audit: also report the existing Pinata usage and encryption (if any), the dispute evidence flow, any existing chat or deliverable-checklist code, how the relayer is guarded today, and where credential metadata JSON is built.

- **Phase 7:** `IpfsObject`, encryption helper, relayer allow-list and caps, placement guard test.
- **Phase 8:** chat on database plus polling, then the realtime transport.
- **Phase 9:** task definitions, templates, assignments, submissions, review, gating, analytics.
- **Phase 10:** chat hash chain, task signatures, Merkle batches, proofs endpoint (database only).
- **Phase 11:** evidence bundle builder, Pinata pinning, wiring into the dispute flow and credential metadata.
- **Phase 12 (needs my approval):** optional anchor contract.

Add to the final report: which items of section 15.2 were implemented exactly as specified and which deviate, with reasons; every place where the platform (not a contract) is the enforcer; and the measured number of sponsored transactions per day under a realistic test run.
