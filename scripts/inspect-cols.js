import { prisma } from "../lib/prisma.js";

async function main() {
  const constraints = await prisma.$queryRawUnsafe(`
    SELECT conname, contype 
    FROM pg_constraint 
    WHERE conname = 'meeting_no_mentor_overlap';
  `);
  console.log("Found constraint:", constraints);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
