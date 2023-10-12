import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Signer } from "@solana/web3.js";
import { Client, Context, DataFetcher } from "../sdk";
import { Poc } from "../target/types/poc";
import * as splToken from "@solana/spl-token";
import { Account } from "@solana/spl-token/src/state/account";

export class Fixture {
  private readonly connection: Connection;
  private readonly program: Program<Poc>;
  private clientKeyPair: Map<string, Signer> = new Map();

  readonly dataFetcher: DataFetcher;

  constructor(connection: Connection, program: Program<Poc>) {
    this.connection = connection;
    this.program = program;
    this.dataFetcher = new DataFetcher(program);
  }

  async createUser(airdropLamports: number = 0): Promise<Client> {
    const keypair: Keypair = Keypair.generate();

    this.clientKeyPair = this.clientKeyPair.set(keypair.publicKey.toString(), keypair);
    if (airdropLamports !== 0) {
      await this.requestAirdrop(keypair.publicKey, airdropLamports);
    }

    const anchorContext = new AnchorProvider(this.connection, new anchor.Wallet(keypair), AnchorProvider.defaultOptions());
    const context: Context = new Context(anchorContext, this.program);

    return new Client(context);
  }

  async createAssociatedTokenAccount(user: Client, mint: anchor.web3.PublicKey): Promise<Account> {
    const keyPair = this.clientKeyPair.get(user.context.provider.wallet.publicKey.toString());
    return splToken.getOrCreateAssociatedTokenAccount(this.connection, keyPair, mint, keyPair.publicKey);
  }

  async airdropQuoteToken(user: Client, airdropLamports: number): Promise<PublicKey> {
    const keyPair = this.clientKeyPair.get(user.context.provider.wallet.publicKey.toString());

    const quoteTokenMint = await splToken.createMint(this.connection, keyPair, keyPair.publicKey, keyPair.publicKey, 6);

    const receiverTokenAccount = await this.createAssociatedTokenAccount(user, quoteTokenMint);
    await splToken.mintTo(this.connection, keyPair, quoteTokenMint, receiverTokenAccount.address, keyPair, airdropLamports);

    return quoteTokenMint;
  }

  private async requestAirdrop(user: anchor.web3.PublicKey, amount: number): Promise<void> {
    const airdropTxHash: string = await this.connection.requestAirdrop(user, amount);
    const latestBlockHash = await this.connection.getLatestBlockhash();

    await this.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTxHash,
    });
  }
}
