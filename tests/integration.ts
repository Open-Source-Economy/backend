import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../target/types/poc";
import { Fixture } from "./project-fixture";
import * as assert from "assert";
import { ABC, AbcUtils, Client, InitializeParams, MathUtils, MintData, Project, RedeemData, SetUpAbcParams } from "../sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";

describe("Integration test", async () => {
  const program: anchor.Program<Poc> = anchor.workspace.Poc as Program<Poc>;
  const connection: anchor.web3.Connection = anchor.getProvider().connection;

  // Project setup
  const owner: string = "owner";
  const repository: string = "repository";
  const constantMint: BN = MathUtils.toX32(new Decimal(0.1));
  const constantRedeem: BN = MathUtils.toX32(new Decimal(0.0255));
  const projectTokenKeyPair: Keypair = Keypair.generate();
  let quoteTokenMint: PublicKey;

  // helper for the tests
  const fixture: Fixture = new Fixture(connection, program);
  let user: Client;

  describe("initialize", async () => {
    before("Call", async () => {
      user = await fixture.createUser(10_000_000_000);

      const params: InitializeParams = await user.paramsBuilder.initialize(owner, repository, projectTokenKeyPair);
      await user.initialize(params);
    });

    it("Project is well initialized", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);

      assert.equal(project.owner, owner);
      assert.equal(project.repository, repository);
      assert.ok(project.createdAt);
      assert.deepEqual(project.projectTokenMint, projectTokenKeyPair.publicKey);
      assert.equal(project.abc, null);
    });
  });

  describe("setUpAbc", async () => {
    before("Call", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);
      quoteTokenMint = await fixture.airdropQuoteToken(user, 1000);

      const params: SetUpAbcParams = await user.paramsBuilder.setUpAbc(project.owner, project.repository, constantMint, constantRedeem, quoteTokenMint);
      await user.setUpAbc(params);
    });

    it("ABC is well set", async () => {
      const abc: ABC = await fixture.dataFetcher.getABC(owner, repository);

      assert.ok(abc.constantMint.eq(constantMint));
      assert.ok(abc.constantRedeem.eq(constantRedeem));
      assert.deepEqual(abc.quoteTokenMint, quoteTokenMint);
    });
  });

  describe("mintProjectToken", async () => {
    before("Call", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);
      const abc: ABC = await fixture.dataFetcher.getABC(owner, repository);
      const abcUtils: AbcUtils = new AbcUtils(abc);

      await fixture.createAssociatedTokenAccount(user, projectTokenKeyPair.publicKey);

      const quoteAmount: BN = new BN(50);
      const mintData: MintData = abcUtils.getMintDataFromQuote(quoteAmount);

      const mintProjectTokenParams = await user.paramsBuilder.mintProjectToken(project, mintData.minProjectTokenMinted, mintData.quoteAmount);
      await user.mintProjectToken(mintProjectTokenParams);
    });

    it("Amounts are correct", async () => {
      const expectedUserQuoteAmount: BN = new BN(1000 - 50);
      const expectedUserProjectTokenAmount: BN = new BN(500); // quoteAmount / constantMint = 50 / 0.1 = 500
      const expectedAbcReserveQuoteAmount: BN = new BN(13); // expectedUserProjectTokenAmount * constantRedeem = 500 * 0.0255 = 12.75 rounded up
      const expectedTreasuryQuoteAmount: BN = new BN(37); // quoteAmount - expectedAbcReserveQuoteAmount = 50 - 13 = 87
      const expectedTreasuryProjectTokenAmount: BN = new BN(0);

      const userQuoteAmount: BN = await user.getAssociatedTokenAmount(quoteTokenMint);
      const userProjectTokenAmount: BN = await user.getAssociatedTokenAmount(projectTokenKeyPair.publicKey);
      const abcReserveQuoteAmount: BN = await user.getAbcReserveAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryQuoteAmount: BN = await user.getTreasuryAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryProjectTokenAmount: BN = await user.getTreasuryAmount(owner, repository, projectTokenKeyPair.publicKey, program.programId);

      assert.deepEqual(userQuoteAmount, expectedUserQuoteAmount);
      assert.deepEqual(userProjectTokenAmount, expectedUserProjectTokenAmount);
      assert.deepEqual(abcReserveQuoteAmount, expectedAbcReserveQuoteAmount);
      assert.deepEqual(treasuryQuoteAmount, expectedTreasuryQuoteAmount);
      assert.deepEqual(treasuryProjectTokenAmount, expectedTreasuryProjectTokenAmount);
    });
  });

  describe("redeemProjectToken redeem 2/5", async () => {
    before("Call", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);
      const abc: ABC = await fixture.dataFetcher.getABC(owner, repository);
      const abcUtils: AbcUtils = new AbcUtils(abc);

      await fixture.createAssociatedTokenAccount(user, projectTokenKeyPair.publicKey);

      const projectTokenAmount: BN = new BN(200);
      const redeemData: RedeemData = abcUtils.getRedeemDataFromProjectToken(projectTokenAmount);

      const redeemProjectTokenParams = await user.paramsBuilder.redeemProjectToken(project, redeemData.projectTokenAmount, redeemData.minQuoteAmount);
      await user.redeemProjectToken(redeemProjectTokenParams);
    });

    it("Amounts are correct", async () => {
      const expectedUserQuoteAmount: BN = new BN(955); // previous + projectTokenAmount * constantRedeem = 950 - (200 * 0.0255 rounded down) = 950 + (5.1 rounded down)
      const expectedUserProjectTokenAmount: BN = new BN(500 - 200);
      const expectedAbcReserveQuoteAmount: BN = new BN(8); // previous - projectTokenAmount * constantRedeem = 13 - (200 * 0.0255 rounded down) = 13 - (5.1 rounded down)
      const expectedTreasuryQuoteAmount: BN = new BN(37); // previous
      const expectedTreasuryProjectTokenAmount: BN = new BN(0); // previous

      const userQuoteAmount: BN = await user.getAssociatedTokenAmount(quoteTokenMint);
      const userProjectTokenAmount: BN = await user.getAssociatedTokenAmount(projectTokenKeyPair.publicKey);
      const abcReserveQuoteAmount: BN = await user.getAbcReserveAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryQuoteAmount: BN = await user.getTreasuryAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryProjectTokenAmount: BN = await user.getTreasuryAmount(owner, repository, projectTokenKeyPair.publicKey, program.programId);

      assert.deepEqual(userQuoteAmount, expectedUserQuoteAmount);
      assert.deepEqual(userProjectTokenAmount, expectedUserProjectTokenAmount);
      assert.deepEqual(abcReserveQuoteAmount, expectedAbcReserveQuoteAmount);
      assert.deepEqual(treasuryQuoteAmount, expectedTreasuryQuoteAmount);
      assert.deepEqual(treasuryProjectTokenAmount, expectedTreasuryProjectTokenAmount);
    });
  });

  describe("redeemProjectToken redeem 3/5", async () => {
    before("Call", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);
      const abc: ABC = await fixture.dataFetcher.getABC(owner, repository);
      const abcUtils: AbcUtils = new AbcUtils(abc);

      await fixture.createAssociatedTokenAccount(user, projectTokenKeyPair.publicKey);

      const projectTokenAmount: BN = new BN(300);
      const redeemData: RedeemData = abcUtils.getRedeemDataFromProjectToken(projectTokenAmount);

      const redeemProjectTokenParams = await user.paramsBuilder.redeemProjectToken(project, redeemData.projectTokenAmount, redeemData.minQuoteAmount);
      await user.redeemProjectToken(redeemProjectTokenParams);
    });

    it("Amounts are correct", async () => {
      const expectedUserQuoteAmount: BN = new BN(962); // previous + projectTokenAmount * constantRedeem = 950 - (300 * 0.0255 rounded down) = 950 + (7.65 rounded down)
      const expectedUserProjectTokenAmount: BN = new BN(0);
      const expectedAbcReserveQuoteAmount: BN = new BN(1); // previous - projectTokenAmount * constantRedeem = 8 - (300 * 0.0255 rounded down) = 8 - (7.65 rounded down)
      const expectedTreasuryQuoteAmount: BN = new BN(37); // previous
      const expectedTreasuryProjectTokenAmount: BN = new BN(0); // previous

      const userQuoteAmount: BN = await user.getAssociatedTokenAmount(quoteTokenMint);
      const userProjectTokenAmount: BN = await user.getAssociatedTokenAmount(projectTokenKeyPair.publicKey);
      const abcReserveQuoteAmount: BN = await user.getAbcReserveAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryQuoteAmount: BN = await user.getTreasuryAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryProjectTokenAmount: BN = await user.getTreasuryAmount(owner, repository, projectTokenKeyPair.publicKey, program.programId);

      assert.deepEqual(userQuoteAmount, expectedUserQuoteAmount);
      assert.deepEqual(userProjectTokenAmount, expectedUserProjectTokenAmount);
      assert.deepEqual(abcReserveQuoteAmount, expectedAbcReserveQuoteAmount);
      assert.deepEqual(treasuryQuoteAmount, expectedTreasuryQuoteAmount);
      assert.deepEqual(treasuryProjectTokenAmount, expectedTreasuryProjectTokenAmount);
    });
  });

  describe("donate", async () => {
    before("Call", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);
      const abc: ABC = await fixture.dataFetcher.getABC(owner, repository);
      const abcUtils: AbcUtils = new AbcUtils(abc);

      await fixture.createAssociatedTokenAccount(user, projectTokenKeyPair.publicKey);

      const quoteAmount: BN = new BN(62);
      const mintProjectTokenParams = await user.paramsBuilder.donate(project, quoteAmount);

      await user.donate(mintProjectTokenParams);
    });

    it("Amounts are correct", async () => {
      const expectedUserQuoteAmount: BN = new BN(900); // previous - quoteAmount = 962 - 62 = 900
      const expectedUserProjectTokenAmount: BN = new BN(0); // previous
      const expectedAbcReserveQuoteAmount: BN = new BN(17); // previous + expectedTreasuryProjectTokenAmount * constantRedeem = 1 + 620 * 0.0255 = 1 + 15.81 rounded up
      const expectedTreasuryQuoteAmount: BN = new BN(83); // previous + quoteAmount - expectedAbcReserveQuoteAmount = 37 + 62 - 16 = 83
      const expectedTreasuryProjectTokenAmount: BN = new BN(620); // quoteAmount / constantMint = 62 / 0.1 = 620

      const userQuoteAmount: BN = await user.getAssociatedTokenAmount(quoteTokenMint);
      const userProjectTokenAmount: BN = await user.getAssociatedTokenAmount(projectTokenKeyPair.publicKey);
      const abcReserveQuoteAmount: BN = await user.getAbcReserveAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryQuoteAmount: BN = await user.getTreasuryAmount(owner, repository, quoteTokenMint, program.programId);
      const treasuryProjectTokenAmount: BN = await user.getTreasuryAmount(owner, repository, projectTokenKeyPair.publicKey, program.programId);

      assert.deepEqual(userQuoteAmount, expectedUserQuoteAmount);
      assert.deepEqual(userProjectTokenAmount, expectedUserProjectTokenAmount);
      assert.deepEqual(abcReserveQuoteAmount, expectedAbcReserveQuoteAmount);
      assert.deepEqual(treasuryQuoteAmount, expectedTreasuryQuoteAmount);
      assert.deepEqual(treasuryProjectTokenAmount, expectedTreasuryProjectTokenAmount);
    });
  });
});
