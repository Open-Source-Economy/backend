use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeIssue {}

pub fn handler(ctx: Context<InitializeIssue>, issue_number: u64) -> Result<()> {
    Ok(())
}
