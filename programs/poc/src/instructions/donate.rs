use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Donate {}

pub fn handler(ctx: Context<Donate>, quote_amount: u64) -> Result<()> {
    Ok(())
}
