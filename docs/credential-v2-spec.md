# Trust Lesson — Verifiable Credential V2 Specification

> **Version**: 2.0 | **Status**: Implementation | **Date**: 2026-09

## Overview

Trust Lesson V2 upgrades Soulbound Tokens (SBT) from simple reputation markers to **composable, portable Verifiable Credentials** that meet W3C VC standards.

## Architecture

### Smart Contracts

| Contract | Address | Role |
|----------|---------|------|
| `VerifiableCredential.sol` | `0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D` | Issues EIP-712 signed credentials to both learner and mentor |
| `SkillGraph.sol` | `0x99303483484cc2c9393138574969f15C415A3016` | On-chain skill node graph with prerequisite tracking |

### Credential Types

| Type | Issued To | Trigger |
|------|-----------|----------|
| `LEARNER_COMPLETION` (0) | Learner wallet | Session completed, all milestones confirmed |
| `MENTOR_DELIVERY` (1) | Mentor wallet | Session completed, all milestones confirmed |

## EIP-712 Typed Signature (Portable Verification)

Every credential gets an **EIP-712 typed hash** signed by the Trust Lesson platform key.

### Domain
```json
{
  "name": "Trust Lesson Credentials",
  "version": "1",
  "chainId": 421614,
  "verifyingContract": "<VerifiableCredential contract address>"
}
```

### Type Hash
```solidity
bytes32 CREDENTIAL_TYPEHASH = keccak256(
  "Credential(address subject,bytes32 skillNodeId,uint256 sessionId,uint8 rating,uint8 credType,uint256 issuedAt)"
);
```

### Off-Chain Verification (No Trust Lesson Login Required)

Any DAO, job board, or external verifier can verify a credential:

```javascript
import { ethers } from "ethers";

const domain = {
  name: "Trust Lesson Credentials",
  version: "1",
  chainId: 421614,
  verifyingContract: "<contract address>"
};

const types = {
  Credential: [
    { name: "subject",     type: "address" },
    { name: "skillNodeId", type: "bytes32" },
    { name: "sessionId",   type: "uint256" },
    { name: "rating",      type: "uint8"   },
    { name: "credType",    type: "uint8"   },
    { name: "issuedAt",    type: "uint256" },
  ]
};

const signer = ethers.verifyTypedData(domain, types, credentialValue, signature);
// signer === Trust Lesson platform address → credential is authentic
```

## W3C Verifiable Credential (JSON-LD)

Each credential exports as a W3C-compliant JSON-LD document:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://trustlesson.io/credentials/v1"
  ],
  "type": ["VerifiableCredential", "TrustLessonCredential", "LearnerCompletionCredential"],
  "issuer": {
    "id": "did:pkh:eip155:421614:<contract>",
    "name": "Trust Lesson Platform"
  },
  "credentialSubject": {
    "id": "did:pkh:eip155:421614:<learner-address>",
    "skill": {
      "name": "Solidity Security",
      "nodeId": "0x..."
    },
    "rating": 5,
    "sessionId": 42
  },
  "proof": {
    "type": "EthereumEip712Signature2021",
    "proofValue": "0x..."
  }
}
```

## Skill Graph

### Predefined Skill Nodes

| Skill | ID (keccak256) | Prerequisites | Min Sessions (L1/L2/L3) | Min Rating (L1/L2/L3) |
|-------|---------------|---------------|-------------------------|----------------------|
| Solidity Basics | `keccak256("Solidity Basics")` | None | 1 / 3 / 5 | 3.0 / 3.5 / 4.0 |
| Web3 Frontend | `keccak256("Web3 Frontend")` | None | 1 / 3 / 5 | 3.0 / 3.5 / 4.0 |
| Solidity Security | `keccak256("Solidity Security")` | Solidity Basics L1 | 1 / 3 / 5 | 3.5 / 4.0 / 4.5 |
| DeFi Architecture | `keccak256("DeFi Architecture")` | Solidity Basics L1 | 1 / 3 / 5 | 3.5 / 4.0 / 4.5 |
| React | `keccak256("React")` | None | 1 / 3 / 5 | 3.0 / 3.5 / 4.0 |
| System Design | `keccak256("System Design")` | None | 1 / 3 / 5 | 3.5 / 4.0 / 4.5 |
| Zero Knowledge Proofs | `keccak256("Zero Knowledge Proofs")` | Solidity Basics L1 | 2 / 5 / 10 | 4.0 / 4.5 / 4.8 |

### Composability Example

```
Learner Alice's Skill Graph after 6 sessions:

  Solidity Basics      ──→  Level 2 (3 sessions, avg 4.2)
         │
         └──→ Solidity Security  ──→  Level 1 (1 session, avg 4.5)
         │
         └──→ DeFi Architecture  ──→  Level 2 (3 sessions, avg 4.0)

  React                ──→  Level 1 (1 session, avg 5.0)

"Alice holds Solidity Security Level 1 credential, backed by 3 Solidity Basics sessions"
→ Verifiable by any external party via EIP-712 signature
```

## Selective Disclosure

**Without ZK (current)**: Share CID + EIP-712 signature + platform public key. Verifier reconstructs the typed hash and verifies the signature.

**With ZK (roadmap)**: Share a ZK proof that you hold a credential with `rating >= 4` in `Solidity Security Level 2` without revealing the exact session ID or counterparty address.

## Integration: External Job Board / DAO

1. User exports credential from `/certificate/[id]` → downloads `credential.json`
2. Job board receives `credential.json`
3. Job board calls `verifyTypedData(domain, types, value, proof.proofValue)`
4. If recovered address === Trust Lesson platform key → credential is authentic
5. Job board can also fetch on-chain confirmation at `VerifiableCredential.credentials(credentialId)`

**No Trust Lesson login required for step 3-5.**
