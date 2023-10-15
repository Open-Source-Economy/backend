import { ABC } from "./data-fetcher";
import BN from "bn.js";

export type MintData = {
  quoteAmount: BN;
  expectedProjectTokenMinted: BN;
  minProjectTokenMinted: BN;
};

export type RedeemData = {
  projectTokenAmount: BN;
  expectedQuoteAmount: BN;
  minQuoteAmount: BN;
};

export class AbcUtils {
  readonly abc: ABC;
  // in bps
  private readonly slippage: number;

  constructor(abc: ABC) {
    this.abc = abc;
    this.slippage = 50;
  }

  getMintDataFromQuote(quoteAmount: BN): MintData {
    const quoteAmountQ64_64: BN = quoteAmount.shln(64);
    // unit: [quote] / [quote / pt] = [pt]
    // fixpoint: Q64_64 / Q96_32 >> 32 = Q96_32 >> 32 = Q128_0
    // round down the number of token given
    const expectedProjectTokenMinted: BN = quoteAmountQ64_64.div(this.abc.constantMint).shrn(32);
    const minProjectTokenMinted: BN = this.adjustForSlippage(expectedProjectTokenMinted, false);

    return {
      quoteAmount,
      expectedProjectTokenMinted,
      minProjectTokenMinted,
    };
  }

  // getMintDataFromProjectToken(projectTokenAmount: BN): MintProjectTokenData {
  //   const quoteAmount: BN;
  //   const expectedProjectTokenMinted: BN;
  //   const minProjectTokenMinted: BN;
  //
  //   return {
  //     quoteAmount,
  //     expectedProjectTokenMinted,
  //     minProjectTokenMinted,
  //   }
  // }

  getRedeemDataFromProjectToken(projectTokenAmount: BN): RedeemData {
    // unit: [pt] * [quote / pt]  = [quote]
    // fixpoint: Q128_0 * Q96_32  >> 32 = Q96_32  >> 32 = Q128_0
    // round down the number of token given
    let quoteAmountQ96_32: BN = projectTokenAmount.mul(this.abc.constantRedeem);
    let expectedQuoteAmount: BN = quoteAmountQ96_32.shrn(32);
    const minQuoteAmount: BN = this.adjustForSlippage(expectedQuoteAmount, false);

    return {
      projectTokenAmount,
      expectedQuoteAmount,
      minQuoteAmount,
    };
  }

  private adjustForSlippage(number: BN, roundUp: boolean): BN {
    if (roundUp) {
      return number.muln(10000 + this.slippage).divn(10000);
    } else {
      return number.muln(10000).divn(10000 + this.slippage);
    }
  }
}
