import { PublicKey, Signer } from "@solana/web3.js";
import BN from "bn.js";

export type DonateParams = {
  args: {
    quoteAmount: BN;
  };
  accounts: {
    user: PublicKey;
    project: PublicKey;
    projectTokenMint: PublicKey;
    quoteTokenMint: PublicKey;
    projectTokenTreasury: PublicKey;
    quoteTreasury: PublicKey;
    quoteAbcReserve: PublicKey;
    userQuoteTokenAccount: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
  };
  signers: Signer[];
};
