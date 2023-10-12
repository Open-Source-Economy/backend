import { PublicKey, Signer } from "@solana/web3.js";
import BN from "bn.js";

export type RedeemProjectTokenParams = {
  args: {
    projectTokenAmount: BN;
    minQuoteAmount: BN;
  };
  accounts: {
    user: PublicKey;
    project: PublicKey;
    projectTokenMint: PublicKey;
    quoteTokenMint: PublicKey;
    quoteAbcReserve: PublicKey;
    userProjectTokenAccount: PublicKey;
    userQuoteTokenAccount: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
  };
  signers: Signer[];
};
