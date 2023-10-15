import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../target/types/poc";
import { Fixture } from "./project-fixture";
import * as assert from "assert";
import { ABC, Client, InitializeParams, MathUtils, Project, SetUpAbcParams } from "../sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";

describe("Poc test", async () => {
  const program: anchor.Program<Poc> = anchor.workspace.Poc as Program<Poc>;
  const connection: anchor.web3.Connection = anchor.getProvider().connection;

  // Project setup
  const owner: string = "owner1";
  const repository: string = "repository1";
  const constantMint: BN = MathUtils.toX32(new Decimal(0.1));
  const constantRedeem: BN = MathUtils.toX32(new Decimal(0.0255));
  const projectTokenKeyPair: Keypair = Keypair.generate();
  let quoteTokenMint: PublicKey;

  // helper for the tests
  const fixture: Fixture = new Fixture(connection, program);
  let user: Client;

  describe("initializeAndSetUpAbc", async () => {
    before("Call", async () => {
      user = await fixture.createUser(10_000_000_000);
      quoteTokenMint = await fixture.airdropQuoteToken(user, 1000);

      const initializeParams: InitializeParams = await user.paramsBuilder.initialize(owner, repository, projectTokenKeyPair);
      const setUpAbcParams: SetUpAbcParams = await user.paramsBuilder.setUpAbc(owner, repository, constantMint, constantRedeem, quoteTokenMint);
      await user.initializeAndSetUpAbc(initializeParams, setUpAbcParams);
    });

    it("Project and ABC are well initialized", async () => {
      const project: Project = await fixture.dataFetcher.getProject(owner, repository);

      assert.equal(project.owner, owner);
      assert.equal(project.repository, repository);
      assert.ok(project.createdAt);
      assert.deepEqual(project.projectTokenMint, projectTokenKeyPair.publicKey);

      const abc: ABC = project.abc;

      assert.ok(abc.constantMint.eq(constantMint));
      assert.ok(abc.constantRedeem.eq(constantRedeem));
      assert.deepEqual(abc.quoteTokenMint, quoteTokenMint);
    });
  });
});
