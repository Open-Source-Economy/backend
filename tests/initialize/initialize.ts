import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../../target/types/poc";
import { Fixture } from "../project-fixture";
import * as assert from "assert";
import { Client, InitializeParams, Project } from "../../sdk";
import { Keypair } from "@solana/web3.js";

describe("initialize", async () => {
  const program: anchor.Program<Poc> = anchor.workspace.Poc as Program<Poc>;
  const connection: anchor.web3.Connection = anchor.getProvider().connection;

  const owner: string = "owner2";
  const repository: string = "repository";
  const projectTokenKeyPair = Keypair.generate();

  const fixture: Fixture = new Fixture(connection, program);
  let user: Client;

  before("Call initialize", async () => {
    user = await fixture.createUser(10_000_000_000);

    const params: InitializeParams = await user.paramsBuilder.initialize(owner, repository, projectTokenKeyPair);
    await user.initialize(params);
  });

  it("owner, repository and createdAt are well set", async () => {
    const project: Project = await fixture.dataFetcher.getProject(owner, repository);

    assert.equal(project.owner, owner);
    assert.equal(project.repository, repository);
    assert.ok(project.createdAt);
    assert.deepEqual(project.projectTokenMint, projectTokenKeyPair.publicKey);
    assert.equal(project.abc, null);
  });
});
