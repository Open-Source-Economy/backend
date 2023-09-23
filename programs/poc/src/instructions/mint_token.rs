use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct MintToken {}

pub fn handler(ctx: Context<MintToken>, min_base_amount: u64, quote_amount: u64) -> Result<()> {
    Ok(())
}
