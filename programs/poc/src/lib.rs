use anchor_lang::prelude::*;
use instructions::*;

#[doc(hidden)]
pub mod instructions;

#[doc(hidden)]
pub mod state;

#[doc(hidden)]
pub mod custom_error;

declare_id!("6fzDcXf8keRc64xq9Si3vXxuUXWTWjAtshG524Pz8FcX");

#[program]
pub mod poc {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        owner: String, // https://medium.com/coinmonks/my-lesson-learn-in-solana-smart-contract-development-27fa361118b1
        repository: String,
    ) -> Result<()> {
        return instructions::initialize::handler(ctx, owner, repository);
    }
}
