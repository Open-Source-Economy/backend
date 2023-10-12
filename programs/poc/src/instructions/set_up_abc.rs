use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::custom_error::CustomError;
use crate::state::{Project, ABC};

#[derive(Accounts)]
pub struct SetUpABC<'info> {
    #[account(mut)]
    pub project_admin: Signer<'info>, // TODO: who has the rights ?

    #[account(
        mut,
        seeds = [
            b"project".as_ref(),
            project.owner.as_bytes(),
            project.repository.as_bytes(),
        ],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub quote_token_mint: Account<'info, Mint>,

    /// The treasury account of the project.
    /// The project community can vote on how to use the funds.
    #[account(
        init,
        payer = project_admin,
        associated_token::mint = quote_token_mint,
        associated_token::authority = project,
        mint::freeze_authority = project,
    )]
    pub quote_treasury: Account<'info, TokenAccount>,

    /// The ABC reserve.
    /// Can not be touched by the project community. Is used to allow project token redeem.
    #[account(
        init,
        seeds = [
            b"abc_reserve".as_ref(),
            project.owner.as_bytes(),
            project.repository.as_bytes(),
            quote_token_mint.key().as_ref(),
        ],
        bump,
        payer = project_admin,
        token::mint = quote_token_mint,
        token::authority = project,
    )]
    pub quote_abc_reserve: Account<'info, TokenAccount>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<SetUpABC>, constant_mint: u64, constant_redeem: u64) -> Result<()> {
    return if constant_mint < constant_redeem {
        return Err(CustomError::WrongABCParams.into());
    } else {
        let project: &mut Account<Project> = &mut ctx.accounts.project;
        let quote_token_mint = ctx.accounts.quote_token_mint.key();

        project.abc = Some(ABC {
            constant_mint,
            constant_redeem,
            quote_token_mint,
        });

        Ok(())
    };
}
