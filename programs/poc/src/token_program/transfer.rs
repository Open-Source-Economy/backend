use anchor_lang::prelude::*;

use anchor_spl::token::{self, Token, TokenAccount, Transfer};

pub fn handler<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: AccountInfo<'info>,
    token_program: &Program<'info, Token>,
    authority_seed: &[&[&[u8]]],
    amount: u64,
) -> Result<()> {
    token::transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
                authority,
            },
            authority_seed,
        ),
        amount,
    )
}
