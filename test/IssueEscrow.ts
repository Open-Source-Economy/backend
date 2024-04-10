import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'hardhat';

describe('IssueEscrow', function() {
  async function deployIssueEscrow() {
    const [escrowAgent, payer, payee] = await hre.ethers.getSigners();

    const IssueEscrow = await hre.ethers.getContractFactory('IssueEscrow');
    const escrowContract = await IssueEscrow.deploy();

    return { escrowContract: escrowContract, escrowAgent: escrowAgent, payer: payer, payee: payee };
  }

  describe('Funding Issue', function() {
    describe('Validations', function() {
      it('Should revert with the right error if amount is 0', async function() {
        const [escrowAgent, funderPayer, mantainerPayee] = await hre.ethers.getSigners();
        const { escrowContract: escrowContract } = await loadFixture(deployIssueEscrow);

        await expect(
          escrowContract
            .connect(funderPayer)
            .fundIssue('https://github.com/neovim/neovim/issues/28234'),
        ).to.be.revertedWith('escrow amount cannot be equal to 0');
      });
    });

    describe('Happy Path', function() {
      it('Should transfer money from funder to escrow contract', async function() {
        const [escrowAgent, funderPayer, mantainerPayee] = await hre.ethers.getSigners();
        const { escrowContract: escrowContract } = await loadFixture(deployIssueEscrow);

        await escrowContract
          .connect(funderPayer)
          .fundIssue('https://github.com/neovim/neovim/issues/28234', {
            value: ethers.parseEther('5'),
          });
        const balance = await ethers.provider.getBalance(escrowContract);
        expect(ethers.formatEther(balance)).to.equal('5.0');
      });
      it('Fund multiple issues, both from funders to escrow contract', async function() {
        const [escrowAgent, funderPayer1, funderPayer2] = await hre.ethers.getSigners();
        const { escrowContract: escrowContract } = await loadFixture(deployIssueEscrow);

        await escrowContract
          .connect(funderPayer1)
          .fundIssue('issue/1', {
            value: ethers.parseEther('5'),
          });
        const balance = await ethers.provider.getBalance(escrowContract);
        expect(ethers.formatEther(balance)).to.equal('5.0');

        await escrowContract
          .connect(funderPayer2)
          .fundIssue('issue/2', {
            value: ethers.parseEther('5'),
          });
        const balance2 = await ethers.provider.getBalance(escrowContract);
        expect(ethers.formatEther(balance2)).to.equal('10.0');
      });
    });
  });
});
