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

    pub fn initialize(ctx: Context<Initialize>, owner: String, repository: String) -> Result<()> {
        return instructions::initialize::handler(ctx, owner, repository);
    }

    // define parameter later
    // Who has the rights to set up the parameters ? One maintainer ? Anyone with default settings ?
    // Can they modify them later ? Yes
    pub fn set_up_abc(ctx: Context<SetUpABC>) -> Result<()> {
        return instructions::set_up_abc::handler(ctx);
    }

    // only in abc is set up
    pub fn mint_token(
        ctx: Context<MintToken>,
        min_base_amount: u64,
        quote_amount: u64,
    ) -> Result<()> {
        return instructions::mint_token::handler(ctx, min_base_amount, quote_amount);
    }

    // abc does not have to be set up
    pub fn donate(ctx: Context<Donate>, quote_amount: u64) -> Result<()> {
        return instructions::donate::handler(ctx, quote_amount);
    }

    // only in abc is set up
    pub fn redeem_token(
        ctx: Context<RedeemToken>,
        base_amount: u64,
        min_quote_amount: u64,
    ) -> Result<()> {
        return instructions::redeem_token::handler(ctx, base_amount, min_quote_amount);
    }

    // State issue:
    // * Open - anyone can add bounty on it. Bounty will be slit between the contributors and the reviewers.
    // * Rejected (not accepted by maintainer / community) - no bounty can be added on it
    // * Accepted (accepted by maintainer / community)  - anyone can add bounty on it. Bounty will be slit between the contributors and the reviewers.
    // * In progress (someone is working on it) - anyone can add bounty on it. Bounty will be slit between the contributors and the reviewers.
    // * In Review.  - anyone can add bounty on it. The Bounty will only go to the reviewers. ? Should we split it between the reviewers and the contributors ?
    pub fn initialize_issue(ctx: Context<InitializeIssue>, issue_number: u64) -> Result<()> {
        return instructions::initialize_issue::handler(ctx, issue_number);
    }

    // ... to be continued
}
