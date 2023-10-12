import { PublicKey, Signer } from "@solana/web3.js";

export type InitializeParams = {
  args: {
    owner: string;
    repository: string;
    projectBump: number;
  };
  accounts: {
    payer: PublicKey;
    project: PublicKey;
    projectTokenMint: PublicKey;
    projectTokenTreasury: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
  };
  signers: Signer[];
};
