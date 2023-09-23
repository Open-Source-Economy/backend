use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("The provided owner should be 50 characters long maximum.")] // 0x1770
    OwnerTooLong,
    #[msg("The provided repository should be 50 characters long maximum.")]
    RepositoryTooLong,
}
