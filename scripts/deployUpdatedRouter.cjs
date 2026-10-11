const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("==================================================");
  console.log("🚀 DEPLOYING UPDATED ESCROW ROUTER ON ARBITRUM SEPOLIA");
  console.log(`   Network  : ${network}`);
  console.log(`   Deployer : ${deployer.address}`);
  console.log("==================================================");

  const mockUsdcAddress = "0x65BfF36b3FD34c58F6543537871D9066CEbA6A44";
  const stakingAddress = "0xE98fdb7cdecBD9D06E473ba68671C299DE6deB1f";
  const credentialAddress = "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D";

  // Deploy EscrowRouter
  console.log("1️⃣ Deploying EscrowRouter...");
  const EscrowRouter = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = await EscrowRouter.deploy(mockUsdcAddress, deployer.address);
  await escrowRouter.waitForDeployment();
  const escrowRouterAddress = await escrowRouter.getAddress();
  console.log(`   ✓ EscrowRouter deployed at: ${escrowRouterAddress}`);

  // Wire Permissions
  console.log("\n2️⃣ Wiring permissions...");
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

  try {
    console.log("   Configuring MentorStaking on EscrowRouter...");
    const txStakeMod = await escrowRouter.setMentorStakingModule(stakingAddress);
    await txStakeMod.wait(1);
    console.log("   ✓ EscrowRouter mentorStakingModule set");

    const MentorStaking = await hre.ethers.getContractFactory("MentorStaking");
    const stakingContract = MentorStaking.attach(stakingAddress);
    const txStakeAuth = await stakingContract.setEscrowRouter(escrowRouterAddress);
    await txStakeAuth.wait(1);
    console.log("   ✓ MentorStaking authorized EscrowRouter");
  } catch (err) {
    console.warn("   ⚠️ Warning wiring MentorStaking:", err.message);
  }

  // Update .env
  console.log("\n3️⃣ Updating .env file...");
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  const updates = {
    NEXT_PUBLIC_ESCROW_CONTRACT: escrowRouterAddress,
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
  console.log("   ✓ .env updated with new EscrowRouter address");

  // Update lib/networkConfig.js
  console.log("\n4️⃣ Updating lib/networkConfig.js...");
  const configPath = path.resolve(process.cwd(), "lib/networkConfig.js");
  let configContent = fs.readFileSync(configPath, "utf8");
  configContent = configContent.replace(
    /escrowRouter:\s*"0x[a-fA-F0-9]+"/,
    `escrowRouter: "${escrowRouterAddress}"`
  );
  fs.writeFileSync(configPath, configContent, "utf8");
  console.log("   ✓ lib/networkConfig.js updated");

  console.log("\n==================================================");
  console.log(`🎉 New EscrowRouter: ${escrowRouterAddress}`);
  console.log(`Arbiscan: https://sepolia.arbiscan.io/address/${escrowRouterAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
