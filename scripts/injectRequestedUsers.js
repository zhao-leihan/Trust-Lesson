import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";
import crypto from "crypto";

const prisma = new PrismaClient();

function randomEthAddress() {
  return "0x" + crypto.randomBytes(20).toString("hex").toLowerCase();
}

async function main() {
  console.log("🔍 Checking existing accounts and injecting requested users into NeonDB...");

  const password = "Rayhan3723";
  const passwordHash = hashPassword(password);

  const targetAccounts = [
    {
      email: "rayhanabbrar233@gmail.com",
      role: "ADMIN",
      name: "Rayhan Abbrar (Admin)",
      nickname: "rayhan_admin",
      bio: "Platform Administrator & Founder. Overseeing protocol security, dispute settlements, and escrow governance.",
      domain: "Platform Administration & Protocol Security",
      isVerified: true,
      walletAddress: "0x1a87b337c76f4e1f7290d98416d639b71a233adm",
    },
    {
      email: "clashroyalg404@gmail.com",
      role: "MENTOR",
      name: "Rayhan Clash (Mentor)",
      nickname: "clash_mentor",
      bio: "Web3 Protocol & Smart Contract Mentor. Specializing in Solidity, Arbitrum Nitro, and DeFi security audits.",
      domain: "Smart Contracts & Protocol Security",
      isVerified: true,
      hourlyRate: 50,
      stakeAmount: 250,
      mentorLevel: "PRO",
      walletAddress: "0x2b87c448d87a5f2a8301ea9527e74ac82b404men",
    },
    {
      email: "rayhanazielabbrar@gmail.com",
      role: "LEARNER",
      name: "Rayhan Aziel Abbrar (Student)",
      nickname: "rayhan_aziel",
      bio: "Enthusiastic Web3 Learner exploring decentralized finance, smart contract auditing, and Ethereum L2 ecosystems.",
      university: "Computer Science & Engineering",
      isVerified: true,
      walletAddress: "0x3c98d559e98b6a3b9412fb0638f85bd93c505stu",
    },
  ];

  for (const acc of targetAccounts) {
    console.log(`\n⏳ Processing ${acc.role}: ${acc.email}...`);

    const existingByEmail = await prisma.user.findUnique({
      where: { email: acc.email.toLowerCase() },
    });

    if (existingByEmail) {
      console.log(`User ${acc.email} exists (ID: ${existingByEmail.id}). Updating password and profile...`);
      const updated = await prisma.user.update({
        where: { email: acc.email.toLowerCase() },
        data: {
          name: acc.name,
          nickname: acc.nickname,
          role: acc.role,
          passwordHash: passwordHash,
          isVerified: acc.isVerified,
          bio: acc.bio,
          domain: acc.domain || existingByEmail.domain,
          hourlyRate: acc.hourlyRate || existingByEmail.hourlyRate,
          stakeAmount: acc.stakeAmount || existingByEmail.stakeAmount,
          mentorLevel: acc.mentorLevel || existingByEmail.mentorLevel,
          university: acc.university || existingByEmail.university,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Updated ${updated.role}: ${updated.email} | ID: ${updated.id}`);
    } else {
      // Check if wallet address is taken
      let walletToUse = acc.walletAddress;
      const existingByWallet = await prisma.user.findUnique({
        where: { walletAddress: walletToUse },
      });
      if (existingByWallet) {
        walletToUse = randomEthAddress();
      }

      const created = await prisma.user.create({
        data: {
          email: acc.email.toLowerCase(),
          name: acc.name,
          nickname: acc.nickname,
          role: acc.role,
          passwordHash: passwordHash,
          walletAddress: walletToUse,
          isVerified: acc.isVerified,
          bio: acc.bio,
          domain: acc.domain || null,
          hourlyRate: acc.hourlyRate || 35,
          stakeAmount: acc.stakeAmount || 0,
          mentorLevel: acc.mentorLevel || "RISING",
          university: acc.university || null,
        },
      });
      console.log(`🎉 Created ${created.role}: ${created.email} | ID: ${created.id}`);
    }
  }

  console.log("\n=======================================================");
  console.log("✨ All 3 Accounts Injected Successfully into NeonDB!");
  console.log("   Password for all 3: Rayhan3723");
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error("❌ Injection error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
