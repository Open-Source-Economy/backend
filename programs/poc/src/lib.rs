use anchor_lang::prelude::*;

declare_id!("6fzDcXf8keRc64xq9Si3vXxuUXWTWjAtshG524Pz8FcX");

#[program]
pub mod poc {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
