import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("1. Enabling btree_gist extension...");
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);
  console.log("   btree_gist extension enabled.");

  console.log("2. Adding meeting_no_mentor_overlap exclusion constraint...");
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'meeting_no_mentor_overlap'
        ) THEN
          ALTER TABLE "Meeting" ADD CONSTRAINT meeting_no_mentor_overlap
            EXCLUDE USING gist ("mentorId" WITH =, tstzrange("startAt", "endAt", '[)') WITH &&)
            WHERE ("status" IN ('PENDING', 'ACCEPTED'));
        END IF;
      END $$;
    `);
    console.log("   meeting_no_mentor_overlap constraint successfully verified/applied.");
  } catch (err) {
    console.error("   Error applying constraint:", err.message);
  }

  console.log("3. Purging mock feedback records from database...");
  const deleteResult = await prisma.feedback.deleteMany({});
  console.log(`   Deleted ${deleteResult.count} mock feedback rows.`);

  console.log("Step 1 database tasks completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
