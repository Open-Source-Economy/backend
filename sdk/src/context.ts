import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Poc } from "../../target/types/poc";

// TODO: can be only the Program
export class Context {
  readonly provider: AnchorProvider;
  readonly program: Program<Poc>;

  constructor(provider: AnchorProvider, program: Program<Poc>) {
    this.provider = provider;
    this.program = program;
  }
}
