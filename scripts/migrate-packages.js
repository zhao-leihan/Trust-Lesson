import { prisma } from "../lib/prisma.js";
import { parsePackages } from "../lib/packages.js";

async function main() {
  console.log("Checking all Offerings for package migration...");
  const offerings = await prisma.offering.findMany({
    select: { id: true, title: true, packages: true },
  });

  console.log(`Found ${offerings.length} total Offerings.`);
  let updatedCount = 0;
  let unparseableRows = [];

  for (const offering of offerings) {
    if (!offering.packages) {
      continue;
    }

    try {
      const parsed = parsePackages(offering.packages);
      if (parsed.length === 0) {
        unparseableRows.push({ id: offering.id, title: offering.title, raw: offering.packages });
        continue;
      }

      const updatedJson = JSON.stringify(parsed);
      if (updatedJson !== offering.packages) {
        await prisma.offering.update({
          where: { id: offering.id },
          data: { packages: updatedJson },
        });
        updatedCount++;
        console.log(`Updated Offering ${offering.id} (${offering.title}) with structured packages:`);
        parsed.forEach(p => console.log(`  - ${p.tier}: ${p.liveSessionsIncluded} sessions, ${p.sessionDurationMin} min, ${p.validityDays} days validity`));
      }
    } catch (err) {
      unparseableRows.push({ id: offering.id, title: offering.title, error: err.message });
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`- Updated: ${updatedCount} offerings`);
  console.log(`- Unparseable rows: ${unparseableRows.length}`);
  if (unparseableRows.length > 0) {
    console.log("Unparseable rows:", unparseableRows);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
