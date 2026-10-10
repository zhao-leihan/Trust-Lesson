import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 [Trust Lesson] Purging all users and dependent transactional records...");

  // 1. Delete dependent transactional records
  try {
    await prisma.milestone.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.videoPurchase.deleteMany({});
    await prisma.video.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.authNonce.deleteMany({});
    console.log("✓ Cleared sessions, disputes, milestones, certificates, nonces.");
  } catch (err) {
    console.warn("Notice during transactional tables cleanup:", err.message);
  }

  // 2. Delete ALL users
  try {
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ Deleted all existing users (count: ${deletedUsers.count}).`);
  } catch (err) {
    console.error("Error deleting users:", err.message);
    throw err;
  }

  // 3. Password hash
  // Default password "Rayhan3723" which matches user's preferred standard
  const defaultPassword = "Rayhan3723";
  const passwordHash = hashPassword(defaultPassword);

  console.log("\n🌱 Seeding requested exact accounts...");

  // Account 1: Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "rayhanabbrar233@gmail.com",
      name: "Rayhan Abbrar",
      nickname: "rayhan_admin",
      role: "ADMIN",
      passwordHash: passwordHash,
      isJuror: true,
      isVerified: true,
      stakeAmount: 1000,
      mentorLevel: "MASTER",
      hourlyRate: 50,
      bio: "Trust Lesson Founder & Lead Protocol Architect. Overseeing dispute settlements, smart escrow governance, and platform security.",
      domain: "Protocol Architecture & Smart Escrows",
      walletAddress: "0x1a87b337c76f4e1f7290d98416d639b71a233adm",
      tokenVersion: 1,
    },
  });
  console.log(`✅ [ADMIN] Created: ${adminUser.email} (${adminUser.name}) - ID: ${adminUser.id}`);

  // Account 2: Gracia Angelina as LEARNER (clashroyalg404@gmail.com)
  const learnerUser = await prisma.user.create({
    data: {
      email: "clashroyalg404@gmail.com",
      name: "Gracia Angelina",
      nickname: "gracia_angelina",
      role: "LEARNER",
      passwordHash: passwordHash,
      isJuror: false,
      isVerified: true,
      stakeAmount: 0,
      mentorLevel: "RISING",
      hourlyRate: 0,
      bio: "Web3 learner exploring Solidity smart contracts, decentralized escrows, and Arbitrum L2 ecosystem.",
      university: "Computer Science",
      walletAddress: "0x2b87c448d87a5f2a8301ea9527e74ac82b404stu",
      tokenVersion: 1,
    },
  });
  console.log(`✅ [LEARNER] Created: ${learnerUser.email} (${learnerUser.name}) - ID: ${learnerUser.id}`);

  // 4. Verify count in DB
  const currentUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, walletAddress: true },
  });
  console.log("\n📋 Active Users in Database:", JSON.stringify(currentUsers, null, 2));
  console.log(`Total users in database: ${currentUsers.length}`);

  console.log("\n=======================================================");
  console.log("🎉 Reset Complete! Only 2 accounts exist now:");
  console.log("1. ADMIN   : rayhanabbrar233@gmail.com | Password: Rayhan3723");
  console.log("2. LEARNER : clashroyalg404@gmail.com   | Name: Gracia Angelina | Password: Rayhan3723");
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error("Fatal error during reset:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
