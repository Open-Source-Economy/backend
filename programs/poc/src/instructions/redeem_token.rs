use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RedeemToken {}

pub fn handler(_tx: Context<RedeemToken>, base_amount: u64, min_quote_amount: u64) -> Result<()> {
    Ok(())
}
