use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetUpABC {}

pub fn handler(ctx: Context<SetUpABC>) -> Result<()> {
    Ok(())
}
