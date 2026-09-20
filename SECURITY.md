# Security Policy — Trust Lesson

Trust Lesson is dedicated to providing a secure, decentralized, and tamper-proof peer-to-peer mentorship platform. We treat all security issues with top priority and welcome contributions from the community and security researchers to keep our users safe.

---

## Supported Versions

| Version | Supported          | Status             |
| ------- | ------------------ | ------------------ |
| 1.0.x   | :white_check_mark: | Current Production |
| < 1.0   | :x:                | Deprecated         |

---

## Smart Contract & Escrow Security Principles

Trust Lesson operates on decentralized escrow architecture anchored on Arbitrum One:

1. **Non-Custodial Escrow Vaults**:
   - User funds are never held in centralized private wallets.
   - Milestone deposits are held by smart contracts until explicit learner confirmation or jury dispute resolution.

2. **Time-Locked Safety Guarantees**:
   - In the event of mentor unresponsiveness or cancelled sessions, 100% of the principal deposit is refundable via automated time-lock clauses.

3. **Client-Side Data Integrity**:
   - Sensitive credentials and keys remain under client custody.
   - Heavy binary files (such as gig video uploads) are isolated from database schemas to protect against local storage denial-of-service or quota poisoning.

---

## Reporting a Vulnerability

If you discover a potential security flaw, vulnerability, or smart contract bug:

> [!IMPORTANT]
> **Please do not file a public GitHub issue.** Public disclosure puts platform users and funds at risk.

### Disclosure Channels
- **Email**: `security@trustlesson.app` (or contact team lead **0xAnakMommy**)
- **Direct Submission**: Reach out via GitHub Private Vulnerability Reporting on this repository.

### Information to Include:
1. **Summary & Description** of the vulnerability.
2. **Steps to Reproduce** (including sample code, transaction payloads, or browser console outputs).
3. **Potential Impact** (e.g. fund drainage, privilege escalation, data manipulation).
4. **Proposed Fix or Mitigation** (optional, but greatly appreciated).

---

## Response & Resolution SLA

- **Acknowledgment**: Within **24 hours** of submission.
- **Triage & Assessment**: Within **48 hours**.
- **Patch & Remediation**: Critical issues are patched and deployed within **72 hours**.

---

## Responsible Disclosure & Bug Bounty

We are committed to coordinating with researchers who follow responsible disclosure practices:
- Give us reasonable time to investigate and remediate the issue before public disclosure.
- Do not access, modify, or destroy user data or active smart contract escrow funds.
- Act in good faith to avoid privacy violations, degradation of user experience, or disruption to platform services.

Eligible security researchers identifying high-severity or critical vulnerabilities may be credited in platform release notes and considered for bounty compensation.
