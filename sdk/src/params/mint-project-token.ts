import { PublicKey, Signer } from "@solana/web3.js";
import BN from "bn.js";

export type MintProjectTokenParams = {
  args: {
    minProjectTokenAmount: BN;
    quoteAmount: BN;
  };
  accounts: {
    user: PublicKey;
    project: PublicKey;
    projectTokenMint: PublicKey;
    quoteTokenMint: PublicKey;
    quoteTreasury: PublicKey;
    quoteAbcReserve: PublicKey;
    userProjectTokenAccount: PublicKey;
    userQuoteTokenAccount: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
  };
  signers: Signer[];
};
