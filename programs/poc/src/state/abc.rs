use anchor_lang::prelude::*;

use crate::custom_error::CustomError;

#[derive(Clone, AnchorDeserialize, AnchorSerialize)]
pub struct ABC {
    /// Q32_32
    /// Unit: [quote / pt] quote currency lamports per project token lamport
    pub constant_mint: u64,
    /// Q32_32
    /// Unit: [quote / pt] quote currency lamports per project token lamport
    pub constant_redeem: u64,

    /// The mint of the token that is used to price the project token
    pub quote_token_mint: Pubkey,
}

#[derive(PartialEq, Debug)]
pub struct MintData {
    pub project_token_amount: u64,
    pub abc_reserve_quote_amount: u64,
    pub treasury_quote_amount: u64,
}

#[derive(PartialEq, Debug)]
pub struct RedeemData {
    pub project_token_amount: u64,
    pub quote_amount: u64,
}

impl ABC {
    pub fn get_mint_data(
        &self,
        min_project_token_amount: u64,
        quote_amount: u64, // TODO: should be non zero
        _project_token_supply: u64,
    ) -> Result<MintData> {
        let project_token_amount: u64 = self.get_mint_project_token_amount(quote_amount)?;

        return if project_token_amount < min_project_token_amount {
            err!(CustomError::MinimumMintAmountNotReached)
        } else {
            let abc_reserve_quote_amount: u64 = {
                let redeem_quote: u64 = self.get_redeem_quote(project_token_amount, true)?;

                // TODO: test when that can happen
                if redeem_quote > quote_amount {
                    quote_amount
                } else {
                    redeem_quote
                }
            };

            let treasury_quote_amount: u64 = quote_amount - abc_reserve_quote_amount;

            Ok(MintData {
                project_token_amount,
                abc_reserve_quote_amount,
                treasury_quote_amount,
            })
        };
    }

    pub fn get_redeem_data(
        &self,
        project_token_amount: u64, // TODO: should be non zero
        min_quote_amount: u64,
        _project_token_supply: u64,
    ) -> Result<RedeemData> {
        let quote_amount: u64 = self.get_redeem_quote(project_token_amount, false)?;
        return if quote_amount < min_quote_amount {
            err!(CustomError::MinimumMintAmountNotReached)
        } else {
            Ok(RedeemData {
                project_token_amount,
                quote_amount,
            })
        };
    }

    fn get_mint_project_token_amount(&self, quote_amount: u64) -> Result<u64> {
        // unit: [quote] / [quote / pt] = [pt]
        // fixpoint: Q64_64 / Q96_32 >> 32 = Q96_32 >> 32 = Q128_0
        // round down the number of token given
        let project_token_amount: u128 = ((quote_amount as u128) << 64)
            .checked_div(self.constant_mint as u128)
            .ok_or(CustomError::DivisionByZero)?
            >> 32;

        return if project_token_amount > u64::MAX as u128 {
            err!(CustomError::NumberDownCast)
        } else {
            Ok(project_token_amount as u64)
        };
    }

    fn get_redeem_quote(&self, project_token_amount: u64, round_up: bool) -> Result<u64> {
        // unit: [pt] * [quote / pt]  = [quote]
        // fixpoint: Q128_0 * Q96_32 = Q96_32
        let quote_q96_32: u128 = (project_token_amount as u128) * self.constant_redeem as u128;

        // fixpoint: Q96_32 >> 32 = Q128_0
        let quote: u128 = if round_up && quote_q96_32 & 0xffffffff > 0 {
            (quote_q96_32 >> 32) + 1
        } else {
            quote_q96_32 >> 32
        };

        return if quote > u64::MAX as u128 {
            err!(CustomError::NumberDownCast)
        } else {
            Ok(quote as u64)
        };
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[cfg(test)]
    mod get_mint_data {
        use super::*;

        #[test]
        fn happy_path() -> Result<()> {
            let min_project_token_amount: u64 = 0;
            let quote_amount: u64 = 10;

            let constant_mint: u64 = 2 << 32; // 2.0
            let constant_redeem: u64 = 1 << 32; // 1.0
            let abc = ABC {
                constant_mint,
                constant_redeem,
                quote_token_mint: Pubkey::new_unique(),
            };

            let expected_project_token_amount: u64 = 5; // quote_amount / constant_mint = 10 / 2 = 5
            let expected_abc_reserve_quote_amount: u64 = 5; // expected_project_token_amount * constant_redeem = 5 * 1 = 5
            let expected_treasury_quote_amount: u64 = 5; // quote_amount - expected_abc_reserve_quote_amount = 10 - 5 = 5

            let expected = MintData {
                project_token_amount: expected_project_token_amount,
                abc_reserve_quote_amount: expected_abc_reserve_quote_amount,
                treasury_quote_amount: expected_treasury_quote_amount,
            };

            let result: MintData = abc.get_mint_data(min_project_token_amount, quote_amount, 0)?;
            assert_eq!(expected, result);

            Ok(())
        }

        #[test]
        fn happy_path_round_amount() -> Result<()> {
            let min_project_token_amount: u64 = 0;
            let quote_amount: u64 = 11;

            let constant_mint: u64 = 2 << 32; // 2.0
            let constant_redeem: u64 = 1 << 32; // 1.0
            let abc = ABC {
                constant_mint,
                constant_redeem,
                quote_token_mint: Pubkey::new_unique(),
            };

            let expected_project_token_amount: u64 = 5; // quote_amount / constant_mint = 11 / 2 = 5,5 rounded down
            let expected_abc_reserve_quote_amount: u64 = 6; // expected_project_token_amount * constant_redeem = 5,5 * 1 = 5,5 rounded up
            let expected_treasury_quote_amount: u64 = 5; // quote_amount - expected_abc_reserve_quote_amount = 11 - 6 = 4

            let expected = MintData {
                project_token_amount: expected_project_token_amount,
                abc_reserve_quote_amount: expected_treasury_quote_amount,
                treasury_quote_amount: expected_abc_reserve_quote_amount,
            };

            let result: MintData = abc.get_mint_data(min_project_token_amount, quote_amount, 0)?;
            assert_eq!(expected, result);

            Ok(())
        }

        #[test]
        fn happy_path_constant_less_than_1() -> Result<()> {
            let min_project_token_amount: u64 = 0;
            let quote_amount: u64 = 11;

            let constant_mint: u64 = 1 << 31; // 0.5
            let constant_redeem: u64 = 1 << 30; // 0.25
            let abc = ABC {
                constant_mint,
                constant_redeem,
                quote_token_mint: Pubkey::new_unique(),
            };

            let expected_project_token_amount: u64 = 22; // quote_amount / constant_mint = 11 / 0.5 = 22
            let expected_abc_reserve_quote_amount: u64 = 6; // expected_project_token_amount * constant_redeem = 22 * 0.25 = 5,5 rounded up
            let expected_treasury_quote_amount: u64 = 5; // quote_amount - expected_abc_reserve_quote_amount = 11 - 5 = 5

            let expected = MintData {
                project_token_amount: expected_project_token_amount,
                abc_reserve_quote_amount: expected_abc_reserve_quote_amount,
                treasury_quote_amount: expected_treasury_quote_amount,
            };

            let result: MintData = abc.get_mint_data(min_project_token_amount, quote_amount, 0)?;
            assert_eq!(expected, result);

            Ok(())
        }
    }
}
