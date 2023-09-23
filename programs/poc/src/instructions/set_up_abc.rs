use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

use crate::state::{Project, ABC};

#[derive(Accounts)]
pub struct SetUpABC<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

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

    #[account(
        init,
        space = ABC::LEN,
        seeds = [
            b"abc".as_ref(),
            project.owner.as_bytes(),
            project.repository.as_bytes(),
        ],
        bump,
        payer = payer
    )]
    pub abc: Account<'info, ABC>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<SetUpABC>) -> Result<()> {
    Ok(())
}
