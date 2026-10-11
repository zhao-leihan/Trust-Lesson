const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("🚀 CREATING & RELEASING REAL ESCROW SESSION ON-CHAIN");
  console.log(`Deployer: ${deployer.address}`);
  console.log("==================================================");

  const mockUsdcAddress = "0x65BfF36b3FD34c58F6543537871D9066CEbA6A44";
  const escrowRouterAddress = "0xF3Ca9731772781e19852E9cE3b1ec7A68Eb3edcA";
  const mentorWallet = "0x0Db11E31A07DDDEC044472c7853fbBc3137F51db";

  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUsdc = MockUSDC.attach(mockUsdcAddress);

  const EscrowRouter = await hre.ethers.getContractFactory("EscrowRouter");
  const escrowRouter = EscrowRouter.attach(escrowRouterAddress);

  const milestoneAmount = hre.ethers.parseUnits("12", 6); // 12 USDC
  const totalDeposit = hre.ethers.parseUnits("13.2", 6);   // 12 + 10% fee = 13.2 USDC

  // 1. Mint USDC to deployer for depositing into escrow
  console.log("1️⃣ Minting 13.2 USDC to deployer...");
  const mintTx = await mockUsdc.mint(deployer.address, totalDeposit);
  await mintTx.wait(1);
  console.log(`   ✓ Minted: ${mintTx.hash}`);

  // 2. Approve EscrowRouter
  console.log("\n2️⃣ Approving EscrowRouter to spend 13.2 USDC...");
  const approveTx = await mockUsdc.approve(escrowRouterAddress, totalDeposit);
  await approveTx.wait(1);
  console.log(`   ✓ Approved: ${approveTx.hash}`);

  // 3. Create Session with Skill
  console.log("\n3️⃣ Calling createSessionWithSkill...");
  const createTx = await escrowRouter.createSessionWithSkill(
    mentorWallet,
    [milestoneAmount],
    "Blockchain Fundamental"
  );
  const createReceipt = await createTx.wait(1);
  console.log(`   ✓ Session Created! Tx: ${createReceipt.hash}`);

  // Check session
  const sessionInfo = await escrowRouter.getSession(0);
  console.log(`   Session 0 status: ${sessionInfo[4]} (1 = FUNDED)`);

  // 4. Release Escrow
  console.log("\n4️⃣ Calling releaseEscrow(0)...");
  const releaseTx = await escrowRouter.releaseEscrow(0);
  const releaseReceipt = await releaseTx.wait(1);
  console.log(`   ✓ Escrow Released to Mentor! Tx: ${releaseReceipt.hash}`);

  const updatedSession = await escrowRouter.getSession(0);
  console.log(`   Session 0 updated status: ${updatedSession[4]} (3 = COMPLETED)`);

  const routerBalance = await mockUsdc.balanceOf(escrowRouterAddress);
  const mentorBalance = await mockUsdc.balanceOf(mentorWallet);
  const accumulatedFees = await escrowRouter.accumulatedFees();

  console.log("\n==================================================");
  console.log("🎉 ON-CHAIN STATE VERIFICATION:");
  console.log(`EscrowRouter USDC Balance: ${hre.ethers.formatUnits(routerBalance, 6)} USDC (fee retained)`);
  console.log(`EscrowRouter Accumulated Fees: ${hre.ethers.formatUnits(accumulatedFees, 6)} USDC`);
  console.log(`Mentor Wallet (0x0Db11E...) USDC Balance: ${hre.ethers.formatUnits(mentorBalance, 6)} USDC`);
  console.log(`Create Tx Hash  : ${createReceipt.hash}`);
  console.log(`Release Tx Hash : ${releaseReceipt.hash}`);
  console.log(`Arbiscan Create : https://sepolia.arbiscan.io/tx/${createReceipt.hash}`);
  console.log(`Arbiscan Release: https://sepolia.arbiscan.io/tx/${releaseReceipt.hash}`);
  console.log("==================================================");

  return {
    createTxHash: createReceipt.hash,
    releaseTxHash: releaseReceipt.hash
  };
}

main().catch((error) => {
  console.error("Execution failed:", error);
  process.exitCode = 1;
});
