use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::custom_error::CustomError;
use crate::state::{MintData, Project, ABC};

#[derive(Accounts)]
pub struct MintProjectToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [
            b"project".as_ref(),
            project.owner.as_bytes(),
            project.repository.as_bytes(),
        ],
        bump,
        constraint = project.abc.is_some() @ CustomError::ABCNotSetUp
    )]
    pub project: Account<'info, Project>,

    // ---------------------
    // --- Token Account ---
    // ---------------------
    #[account(mut, address = project.project_token_mint)]
    pub project_token_mint: Account<'info, Mint>,

    /// TODO: probably not the best practice: project.abc.clone()
    #[account(mut, address = project.abc.clone().unwrap().quote_token_mint)]
    pub quote_token_mint: Account<'info, Mint>,

    // ---------------------
    // --- Token Account ---
    // ---------------------
    /// The treasury account of the project.
    /// The project community can vote on how to use the funds.
    #[account(
        mut,
        associated_token::mint = quote_token_mint,
        associated_token::authority = project,
    )]
    pub quote_treasury: Box<Account<'info, TokenAccount>>,

    /// The ABC reserve.
    /// Can not be touched by the project community. Is used to allow project token redeem.
    #[account(
        mut,
        seeds = [
            b"abc_reserve".as_ref(),
            project.owner.as_bytes(),
            project.repository.as_bytes(),
            quote_token_mint.key().as_ref(),
        ],
        bump,
        token::mint = quote_token_mint,
        token::authority = project,
    )]
    pub quote_abc_reserve: Box<Account<'info, TokenAccount>>,

    /// No need to force it to be an associated token account.
    /// TODO: init_if_needed ? not sure if secure
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = project_token_mint,
        associated_token::authority = user,
        mint::freeze_authority = user
    )]
    pub user_project_token_account: Account<'info, TokenAccount>,

    /// No need to force it to be an associated token account.
    #[account(
        mut,
        token::mint = quote_token_mint,
        token::authority = user
    )]
    pub user_quote_token_account: Box<Account<'info, TokenAccount>>,

    // ---------------
    // --- Program ---
    // ---------------
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(
    ctx: Context<MintProjectToken>,
    min_project_token_amount: u64,
    quote_amount: u64,
) -> Result<()> {
    let project: &Account<Project> = &ctx.accounts.project;
    let abc: &ABC = &project.abc.clone().ok_or(CustomError::ABCNotSetUp)?; // TODO: probably not the best practice: project.abc.clone()

    let project_token_mint: &mut Account<Mint> = &mut ctx.accounts.project_token_mint;
    let mint_data: MintData = abc.get_mint_data(
        min_project_token_amount,
        quote_amount,
        project_token_mint.supply,
    )?;

    // Transfer quote token from user to abc_reserve
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_quote_token_account.to_account_info(),
                to: ctx.accounts.quote_abc_reserve.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
            &[],
        ),
        mint_data.abc_reserve_quote_amount,
    )?;

    // Transfer quote token from user to the treasury
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_quote_token_account.to_account_info(),
                to: ctx.accounts.quote_treasury.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
            &[],
        ),
        mint_data.treasury_quote_amount,
    )?;

    // Mint token to the user
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: project_token_mint.to_account_info(),
                to: ctx.accounts.user_project_token_account.to_account_info(),
                authority: ctx.accounts.project.to_account_info(),
            },
            &[&project.seeds()],
        ),
        mint_data.project_token_amount,
    )?;

    Ok(())
}
