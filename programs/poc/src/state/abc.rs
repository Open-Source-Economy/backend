use anchor_lang::prelude::*;

use std::mem::size_of;

#[account]
pub struct ABC {}

impl ABC {
    pub const LEN: usize = size_of::<ABC>();
}
