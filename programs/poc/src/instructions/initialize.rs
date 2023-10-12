use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::custom_error::CustomError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(owner: String, repository: String)]
pub struct Initialize<'info> {
    /// anyone can init
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Allow only one ABC per project. That is why the project_token_mint is not part of the seeds.
    #[account(
        init,
        space = Project::LEN,
        seeds = [
            b"project".as_ref(),
            owner.as_bytes(),
            repository.as_bytes(),
        ],
        bump,
        payer = payer
    )]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = project,
        mint::freeze_authority = project,
    )]
    pub project_token_mint: Account<'info, Mint>,

    /// The treasury account of the project.
    /// The project community can vote on how to use the funds.
    #[account(
        init,
        payer = payer,
        associated_token::mint = project_token_mint,
        associated_token::authority = project,
        mint::freeze_authority = project,
    )]
    pub project_token_treasury: Box<Account<'info, TokenAccount>>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(
    ctx: Context<Initialize>,
    owner: String,
    repository: String,
    project_bump: u8,
) -> Result<()> {
    return if owner.chars().count() > 50 {
        Err(CustomError::OwnerTooLong.into())
    } else if repository.chars().count() > 50 {
        Err(CustomError::RepositoryTooLong.into())
    } else {
        let project: &mut Account<Project> = &mut ctx.accounts.project;
        project.owner = owner;
        project.repository = repository;
        project.project_token_mint = ctx.accounts.project_token_mint.key();

        let clock: Clock = Clock::get().unwrap();
        project.created_at = clock.unix_timestamp;

        project.bump = [project_bump];
        project.abc = None;

        Ok(())
    };
}
