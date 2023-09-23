use anchor_lang::prelude::*;

use std::mem::size_of;

#[account]
pub struct Project {
    pub owner: String,
    pub repository: String,

    pub created_at: i64,

    /// Bump of the pda
    pub bump: [u8; 1],
}

impl Project {
    // TODO
    pub const LEN: usize = size_of::<Project>();
    // DISCRIMINATOR_LENGTH
    // + PUBLIC_KEY_LENGTH // Author.
    // + TIMESTAMP_LENGTH // Timestamp.
    // + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
    // + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content.
}
