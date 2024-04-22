import { ethers } from 'hardhat';

async function deploy() {

  // const IssueEscrowContract = await ethers.deployContract('EscrowSimple', []);
  const IssueEscrowContract = await ethers.deployContract('IssueEscrow', []);

  await IssueEscrowContract.waitForDeployment();

  console.log(
    `Contract Address: ${await IssueEscrowContract.getAddress()}\nDeployed to ${IssueEscrowContract.target}`,
  );

  return IssueEscrowContract;
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
