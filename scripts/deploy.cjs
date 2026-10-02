const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const USDC_MAINNET = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_SEPOLIA = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const provider = deployer.provider;
  const network = hre.network.name;

  // 1. Initial Balance Tracking
  const initialBalance = await provider.getBalance(deployer.address);
  const initialEthFormatted = hre.ethers.formatEther(initialBalance);

  console.log("==================================================");
  console.log(`🚀 TRUST LESSON V2 CONTRACT DEPLOYMENT`);
  console.log(`   Network          : ${network}`);
  console.log(`   Deployer Address : ${deployer.address}`);
  console.log(`   Starting ETH Bal : ${initialEthFormatted} ETH`);
  console.log("==================================================");

  let usdcAddress = "";

  if (network === "arbitrumOne") {
    usdcAddress = USDC_MAINNET;
  } else if (network === "arbitrumSepolia") {
    usdcAddress = USDC_SEPOLIA;
  } else {
    console.log("\n📦 Deploying MockUSDC for local testing...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log(`   MockUSDC Address : ${usdcAddress}`);
  }

  const deployedContracts = {};
  let totalGasSpent = 0n;

  async function trackDeployment(name, contractPromise) {
    const startBal = await provider.getBalance(deployer.address);
    const contract = await contractPromise;
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    const endBal = await provider.getBalance(deployer.address);
    const cost = startBal - endBal;
    totalGasSpent += cost;
    console.log(`   ✓ ${name.padEnd(22)} : ${addr} (Gas: ${hre.ethers.formatEther(cost)} ETH)`);
    deployedContracts[name] = addr;
    return contract;
  }

  async function trackTx(description, txPromise) {
    const startBal = await provider.getBalance(deployer.address);
    const tx = await txPromise;
    const receipt = await tx.wait();
    const endBal = await provider.getBalance(deployer.address);
    const cost = startBal - endBal;
    totalGasSpent += cost;
    console.log(`   ✓ ${description.padEnd(35)} (Gas: ${hre.ethers.formatEther(cost)} ETH, Tx: ${receipt.hash.slice(0, 14)}...)`);
    return receipt;
  }

  // ─── Step 1: Core Staking & Video ──────────────────────────────
  console.log("\n📦 Step 1: Deploying Staking & Media Modules...");
  const MentorStakingFactory = await hre.ethers.getContractFactory("MentorStaking");
  const staking = await trackDeployment("MentorStaking", MentorStakingFactory.deploy(usdcAddress));

  const VideoAccessFactory = await hre.ethers.getContractFactory("VideoAccess");
  const videoAccess = await trackDeployment("VideoAccess", VideoAccessFactory.deploy(usdcAddress));

  // ─── Step 2: Escrow Router V2 ──────────────────────────────────
  console.log("\n📦 Step 2: Deploying EscrowRouter V2...");
  const EscrowRouterFactory = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = await trackDeployment("EscrowRouter", EscrowRouterFactory.deploy(usdcAddress, deployer.address));

  // ─── Step 3: Skill Graph & Verifiable Credential ───────────────
  console.log("\n📦 Step 3: Deploying SkillGraph & Verifiable Credential V2...");
  const SkillGraphFactory = await hre.ethers.getContractFactory("SkillGraph");
  const skillGraph = await trackDeployment("SkillGraph", SkillGraphFactory.deploy());

  const VerifiableCredentialFactory = await hre.ethers.getContractFactory("VerifiableCredential");
  const verifiableCredential = await trackDeployment("VerifiableCredential", VerifiableCredentialFactory.deploy(deployedContracts.SkillGraph));

  // ─── Step 4: Dispute Council (3-of-5 Multi-Sig) ────────────────
  console.log("\n📦 Step 4: Deploying DisputeCouncil (3-of-5 Multi-Sig)...");
  // Temporary 5 jurors set to deployer address on testnet; can be updated later via updateJuror()
  const jurors = [
    deployer.address,
    deployer.address,
    deployer.address,
    deployer.address,
    deployer.address,
  ];
  const DisputeCouncilFactory = await hre.ethers.getContractFactory("DisputeCouncil");
  const disputeCouncil = await trackDeployment("DisputeCouncil", DisputeCouncilFactory.deploy(deployedContracts.EscrowRouter, deployedContracts.MentorStaking, jurors));

  // ─── Step 5: Wire Permissions ──────────────────────────────────
  console.log("\n🔗 Step 5: Wiring Inter-Contract Authorizations...");

  await trackTx("SkillGraph -> Auth VC", skillGraph.setAuthorized(deployedContracts.VerifiableCredential, true));
  await trackTx("VC -> Auth EscrowRouter", verifiableCredential.setAuthorized(deployedContracts.EscrowRouter, true));
  await trackTx("Escrow -> Set Credential Issuer", escrowRouter.setCredentialIssuer(deployedContracts.VerifiableCredential));
  await trackTx("Escrow -> Set Dispute Council", escrowRouter.setDisputeCouncil(deployedContracts.DisputeCouncil));
  await trackTx("Escrow -> Set Staking Module", escrowRouter.setMentorStakingModule(deployedContracts.MentorStaking));
  await trackTx("Staking -> Auth Escrow for Slash", staking.setEscrowRouter(deployedContracts.EscrowRouter));

  // ─── Step 6: Final Balance & Cost Calculation ──────────────────
  const finalBalance = await provider.getBalance(deployer.address);
  const finalEthFormatted = hre.ethers.formatEther(finalBalance);
  const totalEthSpentFormatted = hre.ethers.formatEther(initialBalance - finalBalance);

  console.log("\n==================================================");
  console.log("💰 ETH EXPENDITURE & BALANCE SUMMARY");
  console.log("==================================================");
  console.log(`   Initial ETH Balance : ${initialEthFormatted} ETH`);
  console.log(`   Final ETH Balance   : ${finalEthFormatted} ETH`);
  console.log(`   Total ETH Spent     : ${totalEthSpentFormatted} ETH`);
  console.log("==================================================");
  console.log("🎉 ALL V2 SMART CONTRACTS DEPLOYED & CONFIGURED!");
  console.log("==================================================");
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT="${deployedContracts.EscrowRouter}"`);
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT="${deployedContracts.MentorStaking}"`);
  console.log(`NEXT_PUBLIC_VIDEO_ACCESS_CONTRACT="${deployedContracts.VideoAccess}"`);
  console.log(`NEXT_PUBLIC_CREDENTIAL_CONTRACT="${deployedContracts.VerifiableCredential}"`);
  console.log(`NEXT_PUBLIC_SKILL_GRAPH_CONTRACT="${deployedContracts.SkillGraph}"`);
  console.log(`NEXT_PUBLIC_DISPUTE_COUNCIL_CONTRACT="${deployedContracts.DisputeCouncil}"`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS="${usdcAddress}"`);
  console.log("==================================================\n");

  // Write deployment output to json for record keeping
  const deploymentRecord = {
    network,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    initialBalanceEth: initialEthFormatted,
    finalBalanceEth: finalEthFormatted,
    totalSpentEth: totalEthSpentFormatted,
    contracts: deployedContracts,
  };

  const recordPath = path.join(__dirname, "..", "deployments_v2_record.json");
  fs.writeFileSync(recordPath, JSON.stringify(deploymentRecord, null, 2));
  console.log(`📝 Deployment record saved to: deployments_v2_record.json\n`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
