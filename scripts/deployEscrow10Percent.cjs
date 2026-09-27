const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("==================================================");
  console.log(`🚀 Deploying EscrowRouter (10% Protocol Cut)`);
  console.log(`   Network  : ${network}`);
  console.log(`   Deployer : ${deployer.address}`);
  console.log("==================================================");

  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
  const repAddress = process.env.NEXT_PUBLIC_REPUTATION_CONTRACT;
  const stakingAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT;

  // Deploy EscrowRouter
  console.log("\n📦 Deploying EscrowRouter with 10% PLATFORM_FEE_BPS...");
  const EscrowRouter = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = await EscrowRouter.deploy(usdcAddress, deployer.address);
  await escrowRouter.waitForDeployment();
  const escrowRouterAddress = await escrowRouter.getAddress();
  console.log(`   EscrowRouter deployed at: ${escrowRouterAddress}`);

  const feeBps = await escrowRouter.PLATFORM_FEE_BPS();
  console.log(`   Verified PLATFORM_FEE_BPS: ${feeBps.toString()} (${Number(feeBps) / 100}%)`);

  // Wire permissions with ReputationRegistry and MentorStaking
  if (repAddress) {
    try {
      console.log(`\n🔗 Authorizing EscrowRouter on ReputationRegistry (${repAddress})...`);
      const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
      const rep = ReputationRegistry.attach(repAddress);
      const tx = await rep.setEscrowRouter(escrowRouterAddress);
      await tx.wait();
      console.log("   ✓ ReputationRegistry authorized");
    } catch (e) {
      console.warn("   ⚠️ ReputationRegistry wiring skipped or failed:", e.message);
    }
  }

  if (stakingAddress) {
    try {
      console.log(`\n🔗 Authorizing EscrowRouter on MentorStaking (${stakingAddress})...`);
      const MentorStaking = await hre.ethers.getContractFactory("MentorStaking");
      const staking = MentorStaking.attach(stakingAddress);
      const tx = await staking.setEscrowRouter(escrowRouterAddress);
      await tx.wait();
      console.log("   ✓ MentorStaking authorized");
    } catch (e) {
      console.warn("   ⚠️ MentorStaking wiring skipped or failed:", e.message);
    }
  }

  console.log("\n==================================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log(`NEW ESCROW ROUTER ADDRESS: ${escrowRouterAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
