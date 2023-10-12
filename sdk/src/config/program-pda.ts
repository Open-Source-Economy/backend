import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { associatedAddress } from "@coral-xyz/anchor/dist/cjs/utils/token";

export const programPda = {
  project: function (owner: string, repository: string, programId: PublicKey): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("project"), Buffer.from(owner), Buffer.from(repository)], programId);
  },
  treasury: function (owner: string, repository: string, tokenMintAddress: PublicKey, programId: PublicKey): PublicKey {
    const [project, _] = this.project(owner, repository, programId);
    return associatedAddress({ mint: tokenMintAddress, owner: project });
  },
  abcReserve: function (owner: string, repository: string, tokenMintAddress: PublicKey, programId: PublicKey): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("abc_reserve"), Buffer.from(owner), Buffer.from(repository), tokenMintAddress.toBuffer()],
      programId
    );
  },
};
