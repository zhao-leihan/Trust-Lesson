import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Creating real accounts: Admin, Mentor, Student...");

  // 1. ADMIN USER
  const adminPassword = "AdminPassword123!";
  const admin = await prisma.user.upsert({
    where: { email: "admin@trustlesson.com" },
    update: {
      name: "Rayhan Young (Admin)",
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
      isVerified: true,
      bio: "Founder of Trust Lesson. Managing platform security, dispute resolutions, and escrow safety.",
    },
    create: {
      email: "admin@trustlesson.com",
      name: "Rayhan Young (Admin)",
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase(),
      isVerified: true,
      bio: "Founder of Trust Lesson. Managing platform security, dispute resolutions, and escrow safety.",
    },
  });
  console.log(`✓ Admin created: ${admin.email} (Password: ${adminPassword})`);

  // 2. MENTOR USER
  const mentorPassword = "MentorPassword123!";
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@trustlesson.com" },
    update: {
      name: "0xAnakMommy",
      passwordHash: hashPassword(mentorPassword),
      role: "MENTOR",
      domain: "Smart Contract & Web3 Architecture",
      hourlyRate: 45,
      stakeAmount: 500,
      isVerified: true,
      bio: "Lead Developer & Web3 Architect at Trust Lesson. Expert in Solidity, Hardhat, and EVM escrow systems.",
    },
    create: {
      email: "mentor@trustlesson.com",
      name: "0xAnakMommy",
      passwordHash: hashPassword(mentorPassword),
      role: "MENTOR",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase(),
      domain: "Smart Contract & Web3 Architecture",
      hourlyRate: 45,
      stakeAmount: 500,
      isVerified: true,
      bio: "Lead Developer & Web3 Architect at Trust Lesson. Expert in Solidity, Hardhat, and EVM escrow systems.",
    },
  });
  console.log(`✓ Mentor created: ${mentor.email} (Password: ${mentorPassword})`);

  // 3. STUDENT USER (with University)
  const studentPassword = "StudentPassword123!";
  const student = await prisma.user.upsert({
    where: { email: "student@trustlesson.com" },
    update: {
      name: "Alex Rivera",
      passwordHash: hashPassword(studentPassword),
      role: "LEARNER",
      university: "Stanford University",
      bio: "Computer Science undergraduate passionate about smart contract development and decentralized escrow.",
    },
    create: {
      email: "student@trustlesson.com",
      name: "Alex Rivera",
      passwordHash: hashPassword(studentPassword),
      role: "LEARNER",
      university: "Stanford University",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC".toLowerCase(),
      bio: "Computer Science undergraduate passionate about smart contract development and decentralized escrow.",
    },
  });
  console.log(`✓ Student created: ${student.email} (Password: ${studentPassword}, University: ${student.university})`);

  console.log("\n=======================================================");
  console.log("🎉 All 3 User Accounts Created Successfully in Database!");
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
