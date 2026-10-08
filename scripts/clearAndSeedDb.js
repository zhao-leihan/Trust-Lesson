import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";
import crypto from "crypto";

const prisma = new PrismaClient();

function randomEthAddress() {
  return "0x" + crypto.randomBytes(20).toString("hex").toLowerCase();
}

async function main() {
  console.log("🧹 [Trust Lesson] Starting database cleanup and seeding...");

  // 1. Delete dependent transactional records
  console.log("Deleting existing transactions, disputes, and sessions...");
  try {
    await prisma.milestone.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.videoPurchase.deleteMany({});
    await prisma.video.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.authNonce.deleteMany({});
    await prisma.offering.deleteMany({});
    await prisma.resource.deleteMany({});
    console.log("✓ Successfully cleared transactional tables.");
  } catch (err) {
    console.warn("Notice during table clear:", err.message);
  }

  // 2. Clear old or stale users
  try {
    await prisma.user.deleteMany({});
    console.log("✓ Cleared existing users.");
  } catch (err) {
    console.warn("Notice during user clear:", err.message);
  }

  // 3. Seed Primary Admins & Verified Users
  const defaultPassword = "AdminPassword123!";
  const passwordHash = hashPassword(defaultPassword);

  const initialUsers = [
    {
      email: "rayhanabbrar233@gmail.com",
      role: "ADMIN",
      isJuror: true,
      name: "Rayhan Abbrar",
      nickname: "rayhan_admin",
      bio: "Trust Lesson Protocol Architect & Super Admin. Dispute Council Juror.",
      domain: "Protocol Architecture & Smart Escrows",
      isVerified: true,
      stakeAmount: 1000,
      mentorLevel: "MASTER",
      walletAddress: "0x1a87b337c76f4e1f7290d98416d639b71a233adm",
      hourlyRate: 50,
    },
    {
      email: "jilonasalma@gmail.com",
      role: "ADMIN",
      isJuror: true,
      name: "Jilona Salma",
      nickname: "jilona_admin",
      bio: "Trust Lesson Co-Founder & Global Operations Lead. Dispute Council Juror.",
      domain: "Global Operations & Protocol Governance",
      isVerified: true,
      stakeAmount: 1000,
      mentorLevel: "MASTER",
      walletAddress: "0x2c98d559e98b6a3b9412fb0638f85bd93c505adm",
      hourlyRate: 50,
    },
    {
      email: "clashroyalg404@gmail.com",
      role: "MENTOR",
      isJuror: true, // Qualified as mentor juror (>100 stake, PRO level)
      name: "Rayhan Clash",
      nickname: "clash_mentor",
      bio: "Web3 Protocol & Smart Contract Mentor. Qualified Dispute Council Juror.",
      domain: "Smart Contracts & Protocol Security",
      isVerified: true,
      hourlyRate: 45,
      stakeAmount: 300,
      mentorLevel: "PRO",
      walletAddress: "0x2b87c448d87a5f2a8301ea9527e74ac82b404men",
    },
    {
      email: "rayhanazielabbrar@gmail.com",
      role: "LEARNER",
      isJuror: false,
      name: "Rayhan Aziel Abbrar",
      nickname: "rayhan_student",
      bio: "Web3 learner exploring Solidity, Arbitrum L2, and decentralized escrows.",
      university: "Computer Science",
      isVerified: true,
      stakeAmount: 0,
      mentorLevel: "RISING",
      walletAddress: "0x3c98d559e98b6a3b9412fb0638f85bd93c505stu",
      hourlyRate: 0,
    },
  ];

  for (const u of initialUsers) {
    const created = await prisma.user.create({
      data: {
        email: u.email.toLowerCase(),
        name: u.name,
        nickname: u.nickname,
        passwordHash,
        role: u.role,
        isJuror: u.isJuror,
        isVerified: u.isVerified,
        bio: u.bio,
        domain: u.domain || null,
        university: u.university || null,
        hourlyRate: u.hourlyRate || 35,
        stakeAmount: u.stakeAmount || 0,
        mentorLevel: u.mentorLevel || "RISING",
        walletAddress: u.walletAddress,
        tokenVersion: 1,
      },
    });
    console.log(`✓ Seeded ${created.role} [Juror: ${created.isJuror}]: ${created.email} (${created.name})`);
  }

  // 4. Seed clean, real Course Offering
  await prisma.offering.create({
    data: {
      offeringType: "course",
      modelType: "GIG",
      currency: "USDC",
      title: "Mastering Smart Escrows on Arbitrum Nitro",
      category: "Coding",
      price: 50.0,
      duration: "4 Weeks",
      rating: 5.0,
      sessionsCount: 12,
      reputation: 98,
      level: "Intermediate",
      description: "Hands-on, milestone-based smart contract course. Learn how non-custodial escrows, EIP-712 credentials, and dispute councils operate on Arbitrum.",
      coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
      mentorName: "Rayhan Clash",
      mentorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      mentorAddress: "0x2b87c448d87a5f2a8301ea9527e74ac82b404men",
      meetingPlatform: "Google Meet",
      verified: true,
      milestones: JSON.stringify([
        { title: "Milestone 1: Architecture & Setup", amount: 15.0 },
        { title: "Milestone 2: Escrow Smart Contract Testing", amount: 15.0 },
        { title: "Milestone 3: Arbitrum Deployment & SBT Issuance", amount: 20.0 },
      ]),
    },
  });
  console.log("✓ Seeded sample course offering.");

  console.log("\n🎉 Database cleanup and seeding complete!");
  console.log("Credentials:");
  console.log("Admin 1: rayhanabbrar233@gmail.com / AdminPassword123!");
  console.log("Admin 2: jilonasalma@gmail.com / AdminPassword123!");
  console.log("Mentor : clashroyalg404@gmail.com / AdminPassword123!");
  console.log("Student: rayhanazielabbrar@gmail.com / AdminPassword123!");
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
