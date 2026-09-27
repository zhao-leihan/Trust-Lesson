import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding NeonDB with real Leaderboard Mentors, Students, and On-Chain Certificates...");

  const defaultPassword = "Password123!";
  const passwordHash = hashPassword(defaultPassword);

  // ── 1. MENTORS SEEDING ──
  const mentorsData = [
    {
      email: "rayhan@trustlesson.com",
      walletAddress: "0xf2cE5319aeB733fd2279a830260316358A036098".toLowerCase(),
      name: "Rayhan Young",
      nickname: "0xAnakMommy",
      role: "MENTOR",
      domain: "Smart Contract & Web3 Architecture",
      bio: "Founder & Lead Protocol Engineer at Trust Lesson. EVM specialist, author of EscrowRouter.sol and DisputeCouncil.sol.",
      hourlyRate: 65,
      stakeAmount: 500,
      isVerified: true,
      mentorLevel: "MASTER",
      skills: JSON.stringify(["Solidity", "Arbitrum Nitro", "Escrow Vaults"]),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "janet@trustlesson.com",
      walletAddress: "0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC".toLowerCase(),
      name: "Janetiloy",
      nickname: "JanetSecurity",
      role: "MENTOR",
      domain: "Smart Contract Security & DeFi Audits",
      bio: "Former OpenZeppelin contributor and top bug bounty hunter on Immunefi. Passionate about reentrancy and access control safety.",
      hourlyRate: 75,
      stakeAmount: 350,
      isVerified: true,
      mentorLevel: "MASTER",
      skills: JSON.stringify(["Security Audit", "Foundry", "DeFi Attack Vectors"]),
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "marcus@trustlesson.com",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase(),
      name: "Marcus Vance",
      nickname: "MarcusNitro",
      role: "MENTOR",
      domain: "Zero Knowledge & L2 Rollup Scaling",
      bio: "Senior L2 protocol researcher. Expert in Arbitrum Stylus (Rust + WASM), Circom, and recursive SNARKs.",
      hourlyRate: 85,
      stakeAmount: 250,
      isVerified: true,
      mentorLevel: "PRO",
      skills: JSON.stringify(["ZK-SNARKs", "Stylus Rust", "Rollup Compression"]),
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "elena@trustlesson.com",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC".toLowerCase(),
      name: "Elena Rostova",
      nickname: "ElenaGasOpt",
      role: "MENTOR",
      domain: "EVM Gas Optimization & Yul Assembly",
      bio: "EVM bytecode hacker. Reduced protocol gas consumption by over 40% across leading Arbitrum protocols using Yul assembly.",
      hourlyRate: 55,
      stakeAmount: 150,
      isVerified: true,
      mentorLevel: "PRO",
      skills: JSON.stringify(["Yul Assembly", "Gas Optimization", "Huff Language"]),
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "satoshikid@trustlesson.com",
      walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906".toLowerCase(),
      name: "SatoshiKid",
      nickname: "Web3Frontend",
      role: "MENTOR",
      domain: "Web3 Frontend & Viem/Wagmi Integrations",
      bio: "Fullstack Web3 designer & frontend engineer. Helping developers ship production-grade dApps on Arbitrum and Ethereum.",
      hourlyRate: 40,
      stakeAmount: 100,
      isVerified: true,
      mentorLevel: "PRO",
      skills: JSON.stringify(["Next.js", "Viem/Wagmi", "EIP-712 Signatures"]),
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "david@trustlesson.com",
      walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65".toLowerCase(),
      name: "David Chen",
      nickname: "DavidSol",
      role: "MENTOR",
      domain: "Junior Solidity Development & Testing",
      bio: "Solidity developer preparing to stake full 100 USDC for Dispute Council eligibility. Helping beginners write clean smart contracts.",
      hourlyRate: 30,
      stakeAmount: 35,
      isVerified: false,
      mentorLevel: "RISING",
      skills: JSON.stringify(["Solidity Basics", "Hardhat", "ERC-20 Tokens"]),
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const createdMentors = [];
  for (const m of mentorsData) {
    const mentor = await prisma.user.upsert({
      where: { email: m.email },
      update: {
        ...m,
        passwordHash,
      },
      create: {
        ...m,
        passwordHash,
      },
    });
    createdMentors.push(mentor);
  }
  console.log(`✓ ${createdMentors.length} Mentors seeded into NeonDB.`);

  // ── 2. STUDENTS SEEDING ──
  const studentsData = [
    {
      email: "alex.rivera@stanford.edu",
      walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df".toLowerCase(),
      name: "Alex Rivera",
      nickname: "AlexWeb3",
      role: "LEARNER",
      university: "Stanford University",
      bio: "CS sophomore dedicated to smart contract security and decentralized escrow architectures.",
      learningInterests: "Smart Contract Security, Formal Verification, ZK Proofs",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "maya.takahashi@titech.ac.jp",
      walletAddress: "0x976EA74026E72CD55543b04AB426330b63FA3379".toLowerCase(),
      name: "Maya Takahashi",
      nickname: "MayaRollup",
      role: "LEARNER",
      university: "Tokyo Institute of Technology",
      bio: "Blockchain researcher studying Arbitrum nitro consensus and optimistic challenge games.",
      learningInterests: "Arbitrum Nitro, Stylus Rust, Cross-Chain Bridges",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "kevin.oconnor@mit.edu",
      walletAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955".toLowerCase(),
      name: "Kevin O'Connor",
      nickname: "KevinDeFi",
      role: "LEARNER",
      university: "MIT Web3 Club",
      bio: "Quantitative finance student building decentralized lending mechanisms with automated risk liquidation.",
      learningInterests: "DeFi Protocols, Flash Loans, Oracle Security",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "sarah.jenkins@berkeley.edu",
      walletAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f".toLowerCase(),
      name: "Sarah Jenkins",
      nickname: "SarahSol",
      role: "LEARNER",
      university: "UC Berkeley",
      bio: "Electrical engineering and CS student exploring gas optimization and formal verification techniques.",
      learningInterests: "Gas Optimization, Yul, Invariant Testing",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "liam.zhang@nus.edu.sg",
      walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720".toLowerCase(),
      name: "Liam Zhang",
      nickname: "LiamChain",
      role: "LEARNER",
      university: "National University of Singapore",
      bio: "Software engineering undergrad diving deep into EVM storage layouts and soulbound credentials.",
      learningInterests: "Verifiable Credentials, EIP-712, Smart Wallets",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    },
    {
      email: "fatima.almansoor@ethz.ch",
      walletAddress: "0xBcd4042DE499D14e55001CcbB24a551F3b954096".toLowerCase(),
      name: "Fatima Al-Mansoor",
      nickname: "FatimaCrypto",
      role: "LEARNER",
      university: "ETH Zurich",
      bio: "Cryptography graduate student studying zero-knowledge dispute settlement and optimistic assertion games.",
      learningInterests: "ZK Proofs, Dispute Mechanisms, Cryptographic Proofs",
      avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        ...s,
        passwordHash,
      },
      create: {
        ...s,
        passwordHash,
      },
    });
    createdStudents.push(student);
  }
  console.log(`✓ ${createdStudents.length} Students seeded into NeonDB.`);

  // ── 3. SESSIONS & CERTIFICATES SEEDING ──
  // Link Alex Rivera with Rayhan Young
  const session1 = await prisma.session.create({
    data: {
      learnerId: createdStudents[0].id,
      mentorId: createdMentors[0].id,
      status: "COMPLETED",
      totalAmount: 130,
      note: "Smart contract audit milestone completed satisfactorily. 100% attendance verified.",
      milestones: {
        create: [
          { index: 0, title: "Threat Modeling & Attack Vector Identification", amount: 65, status: "RELEASED" },
          { index: 1, title: "Formal Invariant Unit Tests & Hardhat Deployment", amount: 65, status: "RELEASED" },
        ],
      },
    },
  });

  // Certificate for Session 1
  await prisma.certificate.upsert({
    where: { attestationUid: "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e" },
    update: {},
    create: {
      attestationUid: "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e",
      schemaUid: "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e",
      sessionId: session1.id,
      learnerName: createdStudents[0].name,
      learnerAddress: createdStudents[0].walletAddress,
      mentorName: createdMentors[0].name,
      mentorAddress: createdMentors[0].walletAddress,
      skillTitle: "Advanced Smart Contract Auditing & Security",
      category: "Coding",
      rating: 5,
      escrowAmount: 130,
      currency: "USDC",
      network: "Arbitrum Sepolia",
      txHash: "0x2e8f17bc16d84a51e66c7fb414777d853112d785a9bc83d47f9984b5c777e112",
      blockNumber: 120485912,
      contractAddress: "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D",
      credentialId: "1",
      metadataCid: "QmeEzxoFTbFpZUbNEvwozUGPjWHsmF4WeJ41XGqfGobSz7",
      ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmeEzxoFTbFpZUbNEvwozUGPjWHsmF4WeJ41XGqfGobSz7",
      gasSponsored: true,
      sponsorWallet: "0xf2cE5319aeB733fd2279a830260316358A036098",
      gasUsedEth: "0.000042 ETH",
      gasFeeUsd: "0.11",
    },
  });

  // Link Maya Takahashi with Janetiloy
  const session2 = await prisma.session.create({
    data: {
      learnerId: createdStudents[1].id,
      mentorId: createdMentors[1].id,
      status: "COMPLETED",
      totalAmount: 150,
      note: "DeFi reentrancy & flash loan protection milestone finished.",
      milestones: {
        create: [
          { index: 0, title: "Flash Loan Proof-of-Concept Exploit Simulation", amount: 75, status: "RELEASED" },
          { index: 1, title: "Reentrancy Guard & Checks-Effects-Interactions Mitigation", amount: 75, status: "RELEASED" },
        ],
      },
    },
  });

  await prisma.certificate.upsert({
    where: { attestationUid: "0x4b81c33d2890a98b074ecf12489083315a6b0c2688b14a22ad31846b0a79441f" },
    update: {},
    create: {
      attestationUid: "0x4b81c33d2890a98b074ecf12489083315a6b0c2688b14a22ad31846b0a79441f",
      schemaUid: "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e",
      sessionId: session2.id,
      learnerName: createdStudents[1].name,
      learnerAddress: createdStudents[1].walletAddress,
      mentorName: createdMentors[1].name,
      mentorAddress: createdMentors[1].walletAddress,
      skillTitle: "DeFi Protocol Attack Vectors & Defense",
      category: "Coding",
      rating: 5,
      escrowAmount: 150,
      currency: "USDC",
      network: "Arbitrum Sepolia",
      txHash: "0x7d9f28ec16a84b51e66c7fb414777d853112d785a9bc83d47f9984b5c777e334",
      blockNumber: 120486001,
      contractAddress: "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D",
      credentialId: "2",
      metadataCid: "QmR7GSnFmZwbnyGsdEZWjH5x19C75b755CoWkUr8C7vE5n",
      ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmR7GSnFmZwbnyGsdEZWjH5x19C75b755CoWkUr8C7vE5n",
      gasSponsored: true,
      sponsorWallet: "0xf2cE5319aeB733fd2279a830260316358A036098",
      gasUsedEth: "0.000044 ETH",
      gasFeeUsd: "0.12",
    },
  });

  // Additional completed sessions for mentors to establish realistic session counts
  for (let i = 0; i < 5; i++) {
    await prisma.session.create({
      data: {
        learnerId: createdStudents[i % createdStudents.length].id,
        mentorId: createdMentors[i % createdMentors.length].id,
        status: "COMPLETED",
        totalAmount: 100,
        milestones: {
          create: [{ index: 0, title: "Milestone Session Review", amount: 100, status: "RELEASED" }],
        },
      },
    });
  }

  console.log("🎉 Database seeding complete: Real Mentors, Students, and On-Chain Certificates are active in NeonDB!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
