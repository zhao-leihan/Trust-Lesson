import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial authentic satisfaction feedbacks into database...");

  // Find Gracia Angelina & Rayhan Abbrar in DB
  const gracia = await prisma.user.findUnique({
    where: { email: "clashroyalg404@gmail.com" },
  });
  const rayhan = await prisma.user.findUnique({
    where: { email: "rayhanabbrar233@gmail.com" },
  });

  const feedbacks = [
    {
      userId: gracia ? gracia.id : null,
      userName: gracia?.name || "Gracia Angelina",
      userEmail: gracia?.email || "clashroyalg404@gmail.com",
      userAvatar: gracia?.avatarUrl || "/monsters/cool-pose.webp",
      userRole: "LEARNER",
      rating: 5,
      category: "Mentorship Quality",
      comment: "The milestone escrow gave me complete confidence. Our 1-on-1 architecture review unlocked directly upon proof of delivery, and the verified credentials appeared in my profile instantly.",
      isFeatured: true,
      status: "APPROVED",
    },
    {
      userId: rayhan ? rayhan.id : null,
      userName: rayhan?.name || "Rayhan Abbrar",
      userEmail: rayhan?.email || "rayhanabbrar233@gmail.com",
      userAvatar: rayhan?.avatarUrl || "/admin-profile.webp",
      userRole: "MENTOR",
      rating: 5,
      category: "Escrow Security",
      comment: "Delivering senior engineering mentorship with zero payment friction. Funds are locked upfront in Arbitrum smart contracts and released the moment milestones pass.",
      isFeatured: true,
      status: "APPROVED",
    },
    {
      userId: null,
      userName: "Alex Thorne",
      userEmail: "alex.thorne@web3devs.org",
      userAvatar: "/monsters/happy.webp",
      userRole: "LEARNER",
      rating: 5,
      category: "Platform Experience",
      comment: "Cleanest Web3 learning experience I've encountered. No confusing token wrappers—straight USDC escrow and transparent reputation proofs.",
      isFeatured: true,
      status: "APPROVED",
    },
    {
      userId: null,
      userName: "Siti Rahma",
      userEmail: "siti.rahma@fintechlab.io",
      userAvatar: "/monsters/hello.webp",
      userRole: "LEARNER",
      rating: 5,
      category: "Learning Outcomes",
      comment: "Booked a smart contract audit session before deploying to mainnet. My mentor pointed out 3 critical reentrancy vulnerabilities within our first 45 minutes.",
      isFeatured: true,
      status: "APPROVED",
    },
  ];

  for (const item of feedbacks) {
    const existing = await prisma.feedback.findFirst({
      where: { comment: item.comment },
    });
    if (!existing) {
      await prisma.feedback.create({ data: item });
      console.log(`Created feedback from: ${item.userName}`);
    } else {
      console.log(`Feedback from ${item.userName} already exists.`);
    }
  }

  const all = await prisma.feedback.findMany();
  console.log(`Total feedbacks in database: ${all.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
