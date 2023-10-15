import { Context } from "../context";
import * as anchor from "@coral-xyz/anchor";
import { InitializeParams } from "./initialize";
import { programPda } from "../config";
import { SetUpAbcParams } from "./set-up-abc";
import { Keypair, PublicKey } from "@solana/web3.js";
import { associatedAddress, TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MintProjectTokenParams } from "./mint-project-token";
import { Project } from "../data-fetcher";
import BN from "bn.js";
import { RedeemProjectTokenParams } from "./redeem-project-token";
import { DonateParams } from "./donate";

/**
 * Handle Alpha4Vault params
 */
export class ParamsBuilder {
  readonly context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async initialize(owner: string, repository: string, projectTokenKeyPair: Keypair): Promise<InitializeParams> {
    const [project, projectBump] = programPda.project(owner, repository, this.context.program.programId);
    const projectTokenTreasuryAccount = programPda.treasury(owner, repository, projectTokenKeyPair.publicKey, this.context.program.programId);

    return {
      args: {
        owner: owner,
        repository: repository,
        projectBump: projectBump,
      },
      accounts: {
        payer: this.context.provider.publicKey,
        project: project,
        projectTokenMint: projectTokenKeyPair.publicKey,
        projectTokenTreasury: projectTokenTreasuryAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
      signers: [projectTokenKeyPair],
    };
  }

  async setUpAbc(owner: string, repository: string, constantMint: BN, constantRedeem: BN, quoteTokenMint: PublicKey): Promise<SetUpAbcParams> {
    const [projectAddress] = programPda.project(owner, repository, this.context.program.programId);
    const quoteTreasury = programPda.treasury(owner, repository, quoteTokenMint, this.context.program.programId);
    const [quoteAbcReserve] = programPda.abcReserve(owner, repository, quoteTokenMint, this.context.program.programId);

    return {
      args: {
        constantMint,
        constantRedeem,
      },
      accounts: {
        projectAdmin: this.context.provider.publicKey,
        project: projectAddress,
        quoteTokenMint: quoteTokenMint,
        quoteTreasury: quoteTreasury,
        quoteAbcReserve: quoteAbcReserve,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
      signers: [],
    };
  }

  async mintProjectToken(project: Project, minProjectTokenAmount: BN, quoteAmount: BN): Promise<MintProjectTokenParams> {
    const [projectAddress] = programPda.project(project.owner, project.repository, this.context.program.programId);
    const quoteTreasury = programPda.treasury(project.owner, project.repository, project.abc.quoteTokenMint, this.context.program.programId);
    const [quoteAbcReserve] = programPda.abcReserve(project.owner, project.repository, project.abc.quoteTokenMint, this.context.program.programId);

    return {
      args: {
        minProjectTokenAmount,
        quoteAmount,
      },
      accounts: {
        user: this.context.provider.publicKey,
        project: projectAddress,
        projectTokenMint: project.projectTokenMint,
        quoteTokenMint: project.abc.quoteTokenMint,
        quoteTreasury: quoteTreasury,
        quoteAbcReserve: quoteAbcReserve,
        userProjectTokenAccount: associatedAddress({ mint: project.projectTokenMint, owner: this.context.provider.publicKey }),
        userQuoteTokenAccount: associatedAddress({ mint: project.abc.quoteTokenMint, owner: this.context.provider.publicKey }),
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
      signers: [],
    };
  }

  async redeemProjectToken(project: Project, projectTokenAmount: BN, minQuoteAmount: BN): Promise<RedeemProjectTokenParams> {
    const [projectAddress] = programPda.project(project.owner, project.repository, this.context.program.programId);
    const [quoteAbcReserve] = programPda.abcReserve(project.owner, project.repository, project.abc.quoteTokenMint, this.context.program.programId);

    return {
      args: {
        projectTokenAmount,
        minQuoteAmount,
      },
      accounts: {
        user: this.context.provider.publicKey,
        project: projectAddress,
        projectTokenMint: project.projectTokenMint,
        quoteTokenMint: project.abc.quoteTokenMint,
        quoteAbcReserve: quoteAbcReserve,
        userProjectTokenAccount: associatedAddress({ mint: project.projectTokenMint, owner: this.context.provider.publicKey }),
        userQuoteTokenAccount: associatedAddress({ mint: project.abc.quoteTokenMint, owner: this.context.provider.publicKey }),
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [],
    };
  }

  async donate(project: Project, quoteAmount: BN): Promise<DonateParams> {
    const [projectAddress] = programPda.project(project.owner, project.repository, this.context.program.programId);
    const quoteTreasury = programPda.treasury(project.owner, project.repository, project.abc.quoteTokenMint, this.context.program.programId);
    const projectTokenTreasury = programPda.treasury(project.owner, project.repository, project.projectTokenMint, this.context.program.programId);
    const [quoteAbcReserve] = programPda.abcReserve(project.owner, project.repository, project.abc.quoteTokenMint, this.context.program.programId);

    return {
      args: {
        quoteAmount,
      },
      accounts: {
        user: this.context.provider.publicKey,
        project: projectAddress,
        projectTokenMint: project.projectTokenMint,
        quoteTokenMint: project.abc.quoteTokenMint,
        projectTokenTreasury: projectTokenTreasury,
        quoteTreasury: quoteTreasury,
        quoteAbcReserve: quoteAbcReserve,
        userQuoteTokenAccount: associatedAddress({ mint: project.abc.quoteTokenMint, owner: this.context.provider.publicKey }),
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [],
    };
  }
}
