import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
};

// npx hardhat accounts
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    // const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(account.address);
  }
});

// npx hardhat balance --account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);

    console.log(hre.ethers.formatEther(balance), 'ETH');
  });

export default config;
