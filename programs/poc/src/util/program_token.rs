use anchor_lang::prelude::*;

use anchor_spl::token;
use anchor_spl::token::{Burn, Mint, Token, TokenAccount};

use crate::state::Project;

pub fn mint_project_token<'info>(
    project: &Account<'info, Project>,
    project_token_mint: &Account<'info, Mint>,
    user_project_token_account: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    token::mint_to(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            token::MintTo {
                mint: project_token_mint.to_account_info(),
                to: user_project_token_account.to_account_info(),
                authority: project.to_account_info(),
            },
            &[&project.seeds()],
        ),
        amount,
    )
}

pub fn burn_project_token<'info>(
    user: &Signer<'info>,
    project_token_mint: &Account<'info, Mint>,
    user_project_token_account: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    token::burn(
        CpiContext::new(
            token_program.to_account_info(),
            Burn {
                mint: project_token_mint.to_account_info(),
                from: user_project_token_account.to_account_info(),
                authority: user.to_account_info(),
            },
        ),
        amount,
    )
}
