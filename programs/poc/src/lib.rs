use anchor_lang::prelude::*;
use instructions::*;

#[doc(hidden)]
pub mod instructions;

#[doc(hidden)]
pub mod state;

#[doc(hidden)]
pub mod custom_error;

#[doc(hidden)]
pub mod token_program;

#[doc(hidden)]
mod util;

// Should be equal to `solana address -k target/deploy/poc-keypair.json`
declare_id!("GFWhFATGUM63tockDcMgLtBSC8VnPrLNB6Uuhw4CGVk");

#[program]
pub mod poc {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        owner: String,
        repository: String,
        project_bump: u8,
    ) -> Result<()> {
        return instructions::initialize::handler(ctx, owner, repository, project_bump);
    }

    /// Set up the Augmented Bounding Curve.
    ///
    /// For now let's implement our ABC with the simplest function possible, a content function:
    ///    mint(x)   = constant_mint
    ///    redeem(x) = constant_redeem
    ///
    /// x being the lamports amount parameter.
    /// Ie, the mint cost of the x th project token lamport is constant and is constant_mint.
    ///
    /// # Arguments
    ///
    /// * `constant_mint` - Q32_32 in unit quote currency lamports per project token lamport
    /// * `constant_redeem` - Q32_32 in unit quote currency lamports per project token lamport
    ///
    /// Q32_32 is a fixed point number with 32 bits for the integer part and 32 bits for the decimal part.
    ///
    /// # Not in the poc:
    /// Who has the rights to set up the parameters ? One maintainer ? Anyone with default settings ?
    ///  Can they modify them later ? Yes
    pub fn set_up_abc(
        ctx: Context<SetUpABC>,
        constant_mint: u64,
        constant_redeem: u64,
    ) -> Result<()> {
        return instructions::set_up_abc::handler(ctx, constant_mint, constant_redeem);
    }

    /// # Requirements
    ///
    /// Can only be called if the ABC is set up
    ///
    /// # Arguments
    ///
    /// * `min_project_token_amount` - the minimum project token to receive
    /// * `quote_amount` - the amount of quote currency to send
    pub fn mint_project_token(
        ctx: Context<MintProjectToken>,
        min_project_token_amount: u64,
        quote_amount: u64,
    ) -> Result<()> {
        return instructions::mint_project_token::handler(
            ctx,
            min_project_token_amount,
            quote_amount,
        );
    }

    // abc does not have to be set up
    pub fn donate(ctx: Context<Donate>, quote_amount: u64) -> Result<()> {
        return instructions::donate::handler(ctx, quote_amount);
    }

    // only in abc is set up
    pub fn redeem_project_token(
        ctx: Context<RedeemProjectToken>,
        project_token_amount: u64,
        min_quote_amount: u64,
    ) -> Result<()> {
        return instructions::redeem_project_token::handler(
            ctx,
            project_token_amount,
            min_quote_amount,
        );
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
