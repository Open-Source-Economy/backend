import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Poc } from "../target/types/poc";

// Run `solana-test-validator` in a terminal
// anchor test --skip-local-validator
describe("poc", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Poc as Program<Poc>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().accounts({}).rpc();
    console.log("Your transaction signature", tx);
  });
});
