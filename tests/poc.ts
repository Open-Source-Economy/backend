import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../target/types/poc";
import { PublicKey } from "@solana/web3.js";
import { programPda } from "../sdk/pda/program-pda";
import * as assert from "assert";

// `anchor test` does not run for the moment on ly local computer
// Run `solana-test-validator` in a terminal
// anchor test --skip-local-validator
describe("poc", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Poc as Program<Poc>;

  it("Is initialized!", async () => {
    const programId: PublicKey = new PublicKey(
      "6fzDcXf8keRc64xq9Si3vXxuUXWTWjAtshG524Pz8FcX"
    );

    const owner: string = "owner";
    const repository: string = "repository";

    const [project, _] = programPda.project(owner, repository, programId);

    await program.methods
      .initialize("owner", "repository")
      .accounts({
        payer: program.provider.publicKey,
        project: project,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const data = await program.account.project.fetch(project);

    assert.equal(data.owner, owner);
    assert.equal(data.repository, repository);
    assert.ok(data.createdAt);
  });
});
