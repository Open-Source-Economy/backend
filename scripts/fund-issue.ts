import '@nomicfoundation/hardhat-ethers';
import { ethers } from 'hardhat';

// localhost
// const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// sepolia
// RGx]l>(mh{
// const contractAddress = "0x5bA165C89Ac4aC94563dc40962411523F8CA140b";

// staging environment
// const contractAddress = "0xF95F3fBE65e1e78B07F0B0bBf6763CC5A064cC87";
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const gitIssueURL = 'https://github.com/neovim/neovim/issues/28234';

async function fundIssue(gitIssueURL: string) {
  const [escrowAgent, funder, mantainer, addr3, addr4, addr5, addr6, addr7, addr8, addr9] =
    await ethers.getSigners();
  const escrowContract = await ethers.getContractAt('Escrow', contractAddress);
  // await escrowContract.fundIssue(gitIssueURL, { value: ethers.parseEther('0.1') });
  const tx = await escrowContract
    .connect(funder)
    .fundIssue(gitIssueURL, { value: ethers.parseEther('5') });
  // const tx = await escrowContract.connect(owner).sendToMantainer(gitIssueURL, addr2);

  // 2. Let's calculate the gas spent
  const receipt = await tx.wait();
  // const gasSpent = receipt.gasUsed.mul(receipt.gasPrice);
  if (receipt != null) {
    console.log(receipt.gasPrice * receipt.gasUsed);
  }
  // 3. Now we know, it is 15 ETH minus by gasSpent!
  // expect(await owner.getBalance()).to.eq(parseEther(15).sub(gasSpent));
  const funderBalance = await ethers.provider.getBalance(funder.address);
  console.log(ethers.formatEther(funderBalance), 'ETH');
  const escrowContractBalance = await ethers.provider.getBalance(contractAddress);
  console.log(ethers.formatEther(escrowContractBalance), 'ETH');
}

// alice staging wallet

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
fundIssue(gitIssueURL)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// NOTE: STAGING ENVIRONMENT
// Contract Address: 0xa429439d472Aec1D27fCFc1bb8b71097e9A480f0

// NOTE: Alice: 0x056e17517f1e8d6d0799d8D711E20f342d4320f5
