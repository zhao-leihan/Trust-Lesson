const hre = require("hardhat");

const USDC_MAINNET = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_SEPOLIA = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

// Jurors for DisputeCouncil — update before mainnet deploy
// For testnet, deployer fills all 5 slots temporarily
const TESTNET_JURORS = [null, null, null, null, null]; // filled with deployer in script

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("==================================================");
  console.log("🚀 Deploying Trust Lesson V2 Contracts");
  console.log(`   Network  : ${network}`);
  console.log(`   Deployer : ${deployer.address}`);
  console.log("==================================================");

  let usdcAddress = "";

  if (network === "arbitrumOne") {
    usdcAddress = USDC_MAINNET;
  } else if (network === "arbitrumSepolia") {
    usdcAddress = USDC_SEPOLIA;
  } else {
    console.log("\n📦 Deploying MockUSDC for local environment...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log(`   MockUSDC: ${usdcAddress}`);
  }

  // ─── Phase 1: Deploy existing contracts ────────────────────────────────────

  console.log("\n1️⃣  Deploying MentorStaking...");
  const MentorStaking = await hre.ethers.getContractFactory("MentorStaking");
  const staking = await MentorStaking.deploy(usdcAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`   MentorStaking     : ${stakingAddress}`);

  console.log("\n2️⃣  Deploying VideoAccess...");
  const VideoAccess = await hre.ethers.getContractFactory("VideoAccess");
  const videoAccess = await VideoAccess.deploy(usdcAddress);
  await videoAccess.waitForDeployment();
  const videoAccessAddress = await videoAccess.getAddress();
  console.log(`   VideoAccess       : ${videoAccessAddress}`);

  console.log("\n3️⃣  Deploying EscrowRouter (V2 — with ICredentialIssuer + DisputeCouncil slots)...");
  const EscrowRouter = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = await EscrowRouter.deploy(usdcAddress, deployer.address);
  await escrowRouter.waitForDeployment();
  const escrowRouterAddress = await escrowRouter.getAddress();
  console.log(`   EscrowRouter      : ${escrowRouterAddress}`);

  // ─── Phase 2: Deploy V2 contracts ──────────────────────────────────────────

  console.log("\n4️⃣  Deploying SkillGraph...");
  const SkillGraph = await hre.ethers.getContractFactory("SkillGraph");
  const skillGraph = await SkillGraph.deploy();
  await skillGraph.waitForDeployment();
  const skillGraphAddress = await skillGraph.getAddress();
  console.log(`   SkillGraph        : ${skillGraphAddress}`);

  console.log("\n5️⃣  Deploying VerifiableCredential (V2 — replaces ReputationRegistry)...");
  const VerifiableCredential = await hre.ethers.getContractFactory("VerifiableCredential");
  const verifiableCredential = await VerifiableCredential.deploy(skillGraphAddress);
  await verifiableCredential.waitForDeployment();
  const verifiableCredentialAddress = await verifiableCredential.getAddress();
  console.log(`   VerifiableCredential : ${verifiableCredentialAddress}`);

  console.log("\n6️⃣  Deploying DisputeCouncil (3-of-5 multi-sig)...");
  // Fill juror slots with deployer for initial deployment
  const jurors = [
    deployer.address, // Replace with actual juror addresses before mainnet
    deployer.address,
    deployer.address,
    deployer.address,
    deployer.address,
  ];
  const DisputeCouncil = await hre.ethers.getContractFactory("DisputeCouncil");
  const disputeCouncil = await DisputeCouncil.deploy(escrowRouterAddress, jurors);
  await disputeCouncil.waitForDeployment();
  const disputeCouncilAddress = await disputeCouncil.getAddress();
  console.log(`   DisputeCouncil    : ${disputeCouncilAddress}`);

  // ─── Phase 3: Wire permissions ─────────────────────────────────────────────

  console.log("\n🔗 Wiring V2 permissions...");

  // 1. SkillGraph: authorize VerifiableCredential to update progress
  let tx = await skillGraph.setAuthorized(verifiableCredentialAddress, true);
  await tx.wait();
  console.log("   ✓ SkillGraph: VerifiableCredential authorized");

  // 2. VerifiableCredential: authorize EscrowRouter to issue credentials
  tx = await verifiableCredential.setAuthorized(escrowRouterAddress, true);
  await tx.wait();
  console.log("   ✓ VerifiableCredential: EscrowRouter authorized");

  // 3. EscrowRouter: set VerifiableCredential as credential issuer
  tx = await escrowRouter.setCredentialIssuer(verifiableCredentialAddress);
  await tx.wait();
  console.log("   ✓ EscrowRouter: credentialIssuer = VerifiableCredential");

  // 4. EscrowRouter: set DisputeCouncil as resolver
  tx = await escrowRouter.setDisputeCouncil(disputeCouncilAddress);
  await tx.wait();
  console.log("   ✓ EscrowRouter: disputeCouncil = DisputeCouncil");

  // 5. EscrowRouter: set MentorStaking module
  tx = await escrowRouter.setMentorStakingModule(stakingAddress);
  await tx.wait();
  console.log("   ✓ EscrowRouter: mentorStakingModule = MentorStaking");

  // 6. MentorStaking: authorize EscrowRouter for slashing
  tx = await staking.setEscrowRouter(escrowRouterAddress);
  await tx.wait();
  console.log("   ✓ MentorStaking: EscrowRouter authorized for slash");

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log("\n==================================================");
  console.log("🎉 ALL V2 CONTRACTS DEPLOYED AND WIRED!");
  console.log("==================================================");
  console.log("\n📋 Copy these to your .env file:");
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT="${escrowRouterAddress}"`);
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT="${stakingAddress}"`);
  console.log(`NEXT_PUBLIC_VIDEO_ACCESS_CONTRACT="${videoAccessAddress}"`);
  console.log(`NEXT_PUBLIC_CREDENTIAL_CONTRACT="${verifiableCredentialAddress}"`);
  console.log(`NEXT_PUBLIC_SKILL_GRAPH_CONTRACT="${skillGraphAddress}"`);
  console.log(`NEXT_PUBLIC_DISPUTE_COUNCIL_CONTRACT="${disputeCouncilAddress}"`);
  console.log("\n📋 Copy these to ponder/.env:");
  console.log(`PONDER_RPC_URL_421614="https://sepolia-rollup.arbitrum.io/rpc"`);

  console.log("\n⚠️  IMPORTANT — DisputeCouncil jurors are set to deployer address.");
  console.log("   Update using: disputeCouncil.updateJuror(index, newAddress)");
  console.log("   for indices 0-4 before going to mainnet.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
