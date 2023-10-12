import BN from "bn.js";
import * as decimal from "decimal.js";
import { Decimal } from "decimal.js";

export class MathUtils {
  static toX32(num: Decimal): BN {
    return new BN(num.mul(decimal.default.pow(2, 32)).floor().toFixed());
  }

  static fromX32(num: BN): Decimal {
    return new decimal.default(num.toString()).mul(decimal.default.pow(2, -32));
  }
}
