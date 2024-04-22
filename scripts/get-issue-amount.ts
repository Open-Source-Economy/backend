import '@nomicfoundation/hardhat-ethers';
import { ethers } from 'hardhat';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const gitIssueURL = 'https://github.com/neovim/neovim/issues/28234';

async function getIssueAmount(gitIssueURL: string) {
  const [escrowAgent, funder, mantainer, addr3, addr4, addr5, addr6, addr7, addr8, addr9] =
    await ethers.getSigners();
  const escrowContract = await ethers.getContractAt('IssueEscrow', contractAddress);
  // await escrowContract.fundIssue(gitIssueURL, { value: ethers.parseEther('0.1') });
  const tx = await escrowContract
    .connect(escrowAgent)
    // .getIssueAmount(gitIssueURL);
    .getIssueAmount('ciao');
  console.log(tx)
}

// alice staging wallet

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getIssueAmount(gitIssueURL)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// NOTE: STAGING ENVIRONMENT
// Contract Address: 0xa429439d472Aec1D27fCFc1bb8b71097e9A480f0

// NOTE: Alice: 0x056e17517f1e8d6d0799d8D711E20f342d4320f5
