const hre = require("hardhat");

const USDC_MAINNET = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_SEPOLIA = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("==================================================");
  console.log(`🚀 Deploying Trust Lesson Contracts via Hardhat`);
  console.log(`   Network  : ${network}`);
  console.log(`   Deployer : ${deployer.address}`);
  console.log("==================================================");

  let usdcAddress = "";

  if (network === "arbitrumOne") {
    usdcAddress = USDC_MAINNET;
  } else if (network === "arbitrumSepolia") {
    usdcAddress = USDC_SEPOLIA;
  } else {
    // Local / In-memory: deploy MockUSDC
    console.log("\n📦 Deploying MockUSDC for local environment...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log(`   MockUSDC deployed to: ${usdcAddress}`);
  }

  // 1. Deploy ReputationRegistry
  console.log("\n1️⃣  Deploying ReputationRegistry...");
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputation = await ReputationRegistry.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log(`   ReputationRegistry: ${reputationAddress}`);

  // 2. Deploy MentorStaking
  console.log("\n2️⃣  Deploying MentorStaking...");
  const MentorStaking = await hre.ethers.getContractFactory("MentorStaking");
  const staking = await MentorStaking.deploy(usdcAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`   MentorStaking     : ${stakingAddress}`);

  // 3. Deploy VideoAccess
  console.log("\n3️⃣  Deploying VideoAccess...");
  const VideoAccess = await hre.ethers.getContractFactory("VideoAccess");
  const videoAccess = await VideoAccess.deploy(usdcAddress);
  await videoAccess.waitForDeployment();
  const videoAccessAddress = await videoAccess.getAddress();
  console.log(`   VideoAccess       : ${videoAccessAddress}`);

  // 4. Deploy EscrowRouter
  console.log("\n4️⃣  Deploying EscrowRouter...");
  const EscrowRouter = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = await EscrowRouter.deploy(usdcAddress, deployer.address);
  await escrowRouter.waitForDeployment();
  const escrowRouterAddress = await escrowRouter.getAddress();
  console.log(`   EscrowRouter      : ${escrowRouterAddress}`);

  // 5. Wire up permissions
  console.log("\n🔗 Wiring contract permissions...");
  const tx1 = await reputation.setEscrowRouter(escrowRouterAddress);
  await tx1.wait();
  console.log("   ✓ ReputationRegistry: EscrowRouter authorized");

  const tx2 = await staking.setEscrowRouter(escrowRouterAddress);
  await tx2.wait();
  console.log("   ✓ MentorStaking: EscrowRouter authorized for slashing");

  console.log("\n==================================================");
  console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
  console.log("==================================================");
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT="${escrowRouterAddress}"`);
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT="${stakingAddress}"`);
  console.log(`NEXT_PUBLIC_VIDEO_ACCESS_CONTRACT="${videoAccessAddress}"`);
  console.log(`NEXT_PUBLIC_REPUTATION_CONTRACT="${reputationAddress}"`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS="${usdcAddress}"`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
