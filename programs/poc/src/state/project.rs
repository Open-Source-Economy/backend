use anchor_lang::prelude::*;

use crate::state::ABC;
use std::mem::size_of;

#[account]
pub struct Project {
    pub owner: String,
    pub repository: String,
    pub project_token_mint: Pubkey,

    pub created_at: i64,

    pub abc: Option<ABC>,

    /// Bump of the config
    pub bump: [u8; 1],
}

impl Project {
    pub const LEN: usize = size_of::<Project>();

    /// Returns the signer seed of a vault
    pub fn seeds(&self) -> [&[u8]; 4] {
        [
            &b"project"[..],
            self.owner.as_ref(),
            self.repository.as_ref(),
            self.bump.as_ref(),
        ]
    }
}
