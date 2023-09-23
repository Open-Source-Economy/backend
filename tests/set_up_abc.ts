import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../target/types/poc";
import { programPda } from "../sdk";

describe("set up abc", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Poc as Program<Poc>;

  it("Is initialized!", async () => {
    const owner: string = "owner";
    const repository: string = "repository";

    const [project] = programPda.project(owner, repository);
    const [abc] = programPda.abc(owner, repository);

    // TODO: factorize this code
    await program.methods
      .initialize(owner, repository)
      .accounts({
        payer: program.provider.publicKey,
        project: project,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .setUpAbc()
      .accounts({
        payer: program.provider.publicKey,
        project: project,
        abc: abc,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });
});
