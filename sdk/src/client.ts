import { PublicKey, Transaction, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import { Context } from "./context";
import { DonateParams, InitializeParams, ParamsBuilder, RedeemProjectTokenParams, SetUpAbcParams } from "./params";
import { MintProjectTokenParams } from "./params/mint-project-token";
import { associatedAddress } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { getAccount, NATIVE_MINT } from "@solana/spl-token";
import BN from "bn.js";
import { programPda } from "./config";

/**
 * This needs to be re-instantiated every time the alpha4 context or the vault address are updated (when the user goes to another view with another vault)
 */
export class Client {
  readonly context: Context;
  readonly paramsBuilder: ParamsBuilder;

  private readonly skipPreflight: boolean = false;

  constructor(context: Context) {
    this.context = context;
    this.paramsBuilder = new ParamsBuilder(context);
  }

  async initialize(params: InitializeParams): Promise<TransactionSignature> {
    const tx: Transaction = await this.context.program.methods
      .initialize(params.args.owner, params.args.repository, params.args.projectBump)
      .accounts(params.accounts)
      .transaction();
    return this.context.provider.sendAndConfirm(tx, params.signers, { skipPreflight: this.skipPreflight });
  }

  async setUpAbc(params: SetUpAbcParams): Promise<TransactionSignature> {
    const tx: Transaction = await this.context.program.methods
      .setUpAbc(params.args.constantMint, params.args.constantRedeem)
      .accounts(params.accounts)
      .transaction();
    return this.context.provider.sendAndConfirm(tx, params.signers, { skipPreflight: this.skipPreflight });
  }

  async initializeAndSetUpAbc(initializeParams: InitializeParams, setUpAbcParams: SetUpAbcParams): Promise<TransactionSignature> {
    const initializeIx: TransactionInstruction = await this.context.program.methods
      .initialize(initializeParams.args.owner, initializeParams.args.repository, initializeParams.args.projectBump)
      .accounts(initializeParams.accounts)
      .instruction();

    const setUpAbcIx: TransactionInstruction = await this.context.program.methods
      .setUpAbc(setUpAbcParams.args.constantMint, setUpAbcParams.args.constantRedeem)
      .accounts(setUpAbcParams.accounts)
      .instruction();

    const tx: Transaction = new Transaction().add(initializeIx).add(setUpAbcIx);

    return this.context.provider.sendAndConfirm(tx, initializeParams.signers.concat(setUpAbcParams.signers), { skipPreflight: this.skipPreflight });
  }

  async mintProjectToken(params: MintProjectTokenParams): Promise<TransactionSignature> {
    const tx: Transaction = await this.context.program.methods
      .mintProjectToken(params.args.minProjectTokenAmount, params.args.quoteAmount)
      .accounts(params.accounts)
      .transaction();
    return this.context.provider.sendAndConfirm(tx, params.signers, { skipPreflight: this.skipPreflight });
  }

  async redeemProjectToken(params: RedeemProjectTokenParams): Promise<TransactionSignature> {
    const tx: Transaction = await this.context.program.methods
      .redeemProjectToken(params.args.projectTokenAmount, params.args.minQuoteAmount)
      .accounts(params.accounts)
      .transaction();
    return this.context.provider.sendAndConfirm(tx, params.signers, { skipPreflight: this.skipPreflight });
  }

  async donate(params: DonateParams): Promise<TransactionSignature> {
    const tx: Transaction = await this.context.program.methods.donate(params.args.quoteAmount).accounts(params.accounts).transaction();
    return this.context.provider.sendAndConfirm(tx, params.signers, { skipPreflight: this.skipPreflight });
  }

  getSolBalance(): Promise<number> {
    return this.context.provider.connection.getBalance(this.context.provider.publicKey);
  }

  getAssociatedTokenAccount(mint: PublicKey): PublicKey {
    return associatedAddress({ mint, owner: this.context.provider.publicKey });
  }

  async getAssociatedTokenAmount(mint: PublicKey): Promise<BN> {
    if (mint.equals(NATIVE_MINT)) {
      return new BN(await this.getSolBalance());
    } else {
      return getAccount(this.context.provider.connection, this.getAssociatedTokenAccount(mint)).then(_ => new BN(_.amount.toString()));
    }
  }

  async getTreasuryAmount(owner: string, repository: string, tokenMintAddress: PublicKey, programId: PublicKey): Promise<BN> {
    const pubKey = programPda.treasury(owner, repository, tokenMintAddress, programId);
    return getAccount(this.context.provider.connection, pubKey).then(_ => new BN(_.amount.toString()));
  }

  async getAbcReserveAmount(owner: string, repository: string, tokenMintAddress: PublicKey, programId: PublicKey): Promise<BN> {
    const [pubKey] = programPda.abcReserve(owner, repository, tokenMintAddress, programId);
    return getAccount(this.context.provider.connection, pubKey).then(_ => new BN(_.amount.toString()));
  }
}
