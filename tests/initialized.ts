import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../target/types/poc";
import * as assert from "assert";
import { programPda } from "../sdk";

// `anchor test` does not run for the moment on ly local computer
// Run `solana-test-validator` in a terminal
// anchor test --skip-local-validator
describe("initialized", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Poc as Program<Poc>;

  it("Is initialized!", async () => {
    const owner: string = "owner";
    const repository: string = "repository";

    const [project, _] = programPda.project(owner, repository);

    await program.methods
      .initialize(owner, repository)
      .accounts({
        payer: program.provider.publicKey,
        project: project,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const result = await program.account.project.fetch(project);

    assert.equal(result.owner, owner);
    assert.equal(result.repository, repository);
    assert.ok(result.createdAt);
  });
});
