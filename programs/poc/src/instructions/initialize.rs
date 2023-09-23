use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

use crate::custom_error::CustomError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(owner: String, repository: String)]
pub struct Initialize<'info> {
    /// anyone can init
    #[account(mut)]
    pub payer: Signer<'info>,

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

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, owner: String, repository: String) -> Result<()> {
    return if owner.chars().count() > 50 {
        Err(CustomError::OwnerTooLong.into())
    } else if repository.chars().count() > 50 {
        Err(CustomError::RepositoryTooLong.into())
    } else {
        let project: &mut Account<Project> = &mut ctx.accounts.project;
        project.owner = owner;
        project.repository = repository;

        let clock: Clock = Clock::get().unwrap();
        project.created_at = clock.unix_timestamp;

        Ok(())
    };
}
