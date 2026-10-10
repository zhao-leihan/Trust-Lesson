const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const RECIPIENT = "0x78FD0EA940B2e8a97104bCF291De2d87170FD17C";
const MINT_AMOUNT = hre.ethers.parseUnits("100000", 6); // 100,000 USDC (6 decimals)

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("==================================================");
  console.log("🚀 DEPLOYING MOCK USDC & ESCROW ROUTER ON ARBITRUM SEPOLIA");
  console.log(`   Network   : ${network}`);
  console.log(`   Deployer  : ${deployer.address}`);
  console.log(`   Recipient : ${RECIPIENT}`);
  console.log(`   Amount    : 100,000 USDC (${MINT_AMOUNT.toString()} raw units)`);
  console.log("==================================================");

  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH\n`);

  // 1. Deploy MockUSDC
  console.log("1️⃣  Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUsdc = await MockUSDC.deploy();
  await mockUsdc.waitForDeployment();
  const mockUsdcAddress = await mockUsdc.getAddress();
  console.log(`   ✓ MockUSDC deployed at: ${mockUsdcAddress}`);

  // 2. Mint 100,000 USDC to Recipient
  console.log(`\n2️⃣  Minting 100,000 USDC to ${RECIPIENT}...`);
  const mintTx = await mockUsdc.mint(RECIPIENT, MINT_AMOUNT);
  console.log(`   Broadcasted mint tx: ${mintTx.hash}`);
  const mintReceipt = await mintTx.wait(1);
  console.log(`   ✓ Confirmed in block ${mintReceipt.blockNumber}!`);

  const recipientBalance = await mockUsdc.balanceOf(RECIPIENT);
  console.log(`   ✓ Recipient balance: ${hre.ethers.formatUnits(recipientBalance, 6)} USDC`);

  // 3. Deploy MentorStaking with MockUSDC
  console.log("\n3️⃣  Deploying MentorStaking with MockUSDC...");
  const MentorStaking = await hre.ethers.getContractFactory("MentorStaking");
  const staking = await MentorStaking.deploy(mockUsdcAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`   ✓ MentorStaking deployed at: ${stakingAddress}`);

  // 4. Deploy EscrowRouter with MockUSDC
  console.log("\n4️⃣  Deploying EscrowRouter with MockUSDC...");
  const EscrowRouter = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = await EscrowRouter.deploy(mockUsdcAddress, deployer.address);
  await escrowRouter.waitForDeployment();
  const escrowRouterAddress = await escrowRouter.getAddress();
  console.log(`   ✓ EscrowRouter deployed at: ${escrowRouterAddress}`);

  // 5. Wire Permissions
  console.log("\n5️⃣  Wiring permissions with existing V2 infrastructure...");
  const credentialAddress = process.env.NEXT_PUBLIC_CREDENTIAL_CONTRACT;
  const disputeCouncilAddress = process.env.NEXT_PUBLIC_DISPUTE_COUNCIL_CONTRACT;

  if (credentialAddress) {
    try {
      console.log(`   Authorizing EscrowRouter on VerifiableCredential (${credentialAddress})...`);
      const VerifiableCredential = await hre.ethers.getContractFactory("VerifiableCredential");
      const credContract = VerifiableCredential.attach(credentialAddress);
      const txAuth = await credContract.setAuthorized(escrowRouterAddress, true);
      await txAuth.wait(1);
      console.log("   ✓ VerifiableCredential authorized new EscrowRouter");

      const txIssuer = await escrowRouter.setCredentialIssuer(credentialAddress);
      await txIssuer.wait(1);
      console.log("   ✓ EscrowRouter credentialIssuer set");
    } catch (err) {
      console.warn("   ⚠️ Warning wiring VerifiableCredential:", err.message);
    }
  }

  if (disputeCouncilAddress) {
    try {
      console.log(`   Configuring DisputeCouncil on EscrowRouter (${disputeCouncilAddress})...`);
      const txCouncil = await escrowRouter.setDisputeCouncil(disputeCouncilAddress);
      await txCouncil.wait(1);
      console.log("   ✓ EscrowRouter disputeCouncil set");
    } catch (err) {
      console.warn("   ⚠️ Warning wiring DisputeCouncil:", err.message);
    }
  }

  try {
    console.log("   Configuring MentorStaking on EscrowRouter...");
    const txStakeMod = await escrowRouter.setMentorStakingModule(stakingAddress);
    await txStakeMod.wait(1);
    console.log("   ✓ EscrowRouter mentorStakingModule set");

    const txStakeAuth = await staking.setEscrowRouter(escrowRouterAddress);
    await txStakeAuth.wait(1);
    console.log("   ✓ MentorStaking authorized EscrowRouter");
  } catch (err) {
    console.warn("   ⚠️ Warning wiring MentorStaking:", err.message);
  }

  // 6. Update .env file
  console.log("\n6️⃣  Updating .env file with new contract addresses...");
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  const updates = {
    NEXT_PUBLIC_USDC_ADDRESS: mockUsdcAddress,
    NEXT_PUBLIC_ESCROW_CONTRACT: escrowRouterAddress,
    NEXT_PUBLIC_STAKING_CONTRACT: stakingAddress,
  };

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  }

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log("   ✓ .env updated successfully!");

  console.log("\n==================================================");
  console.log("🎉 ALL DEPLOYMENTS, MINTING & WIRING COMPLETE!");
  console.log("==================================================");
  console.log(`Mock USDC Contract : ${mockUsdcAddress}`);
  console.log(`EscrowRouter       : ${escrowRouterAddress}`);
  console.log(`MentorStaking      : ${stakingAddress}`);
  console.log(`Recipient Funded   : ${RECIPIENT} (+100,000 USDC)`);
  console.log(`Explorer Link      : https://sepolia.arbiscan.io/address/${mockUsdcAddress}`);
  console.log(`Mint Tx            : https://sepolia.arbiscan.io/tx/${mintTx.hash}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
