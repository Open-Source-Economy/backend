import { PublicKey, Signer } from "@solana/web3.js";
import BN from "bn.js";

export type SetUpAbcParams = {
  args: {
    constantMint: BN;
    constantRedeem: BN;
  };
  accounts: {
    projectAdmin: PublicKey;
    project: PublicKey;
    quoteTokenMint: PublicKey;
    quoteTreasury: PublicKey;
    quoteAbcReserve: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
  };
  signers: Signer[];
};
