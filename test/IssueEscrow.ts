import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

const erc20Abi = require("./../abi/erc20.json");

describe("IssueEscrow", function () {
  async function deployIssueEscrow() {
    const [escrowAgent, address1, address2] = await hre.ethers.getSigners();

    const IssueEscrow = await hre.ethers.getContractFactory("IssueEscrow");
    const escrowContract = await IssueEscrow.deploy();

    return {
      escrowContract: escrowContract,
      escrowAgent: escrowAgent,
      payer: address1,
      payee: address2,
    };
  }

  describe("Funding Issue", function () {
    describe("Validations", function () {
      it("Should revert with the right error if amount is 0", async function () {
        const { escrowContract, escrowAgent, payer, payee } =
          await loadFixture(deployIssueEscrow);

        await expect(
          escrowContract
            .connect(payer)
            .fundIssue("test-owner", "test-repository", "28234", 0),
        ).to.be.revertedWith("Token amount cannot be 0");
      });
    });

    describe("Happy Path", function () {
      it("Should transfer money from funder to escrow contract", async function () {
        const { escrowContract, escrowAgent, payer, payee } =
          await loadFixture(deployIssueEscrow);

        const USDC_WHALE = "0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E";
        const USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

        await escrowContract
          .connect(escrowAgent)
          .setFundingCurrencyAddress(USDC_ADDRESS);

        // Impersonate the USDC whale
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: [USDC_WHALE],
        });
        const whaleSigner = await ethers.provider.getSigner(USDC_WHALE);

        // Send some Ether to the whale to cover transaction fees
        await payer.sendTransaction({
          to: USDC_WHALE,
          value: ethers.parseEther("1"), // Sending 1 Ether
        });

        const amount = ethers.parseUnits("10", 6); // 10 USDC

        const usdc = await hre.ethers.getContractAt(
          erc20Abi,
          USDC_ADDRESS,
          whaleSigner,
        );
        await usdc.transfer(payer.address, amount); // Transfer USDC to payer

        // Fund the issue with 10 USDC
        await escrowContract
          .connect(payer)
          .fundIssue("test-owner", "test-repository", 28234, amount);

        // Check the USDC balance of the escrow contract
        const balance = await usdc.balanceOf(payer.address);
        expect(balance).to.equal(amount);
      });
    });
  });
});
