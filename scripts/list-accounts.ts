import "@nomicfoundation/hardhat-ethers";
import { ethers } from "hardhat";

async function listAccounts() {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    const balance = await ethers.provider.getBalance(account.address);
    console.log(account.address, ":", ethers.formatEther(balance), "ETH");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
listAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
