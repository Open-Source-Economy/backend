use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("The provided owner should be 50 characters long maximum.")] // 0x1770
    OwnerTooLong,
    #[msg("The provided repository should be 50 characters long maximum.")]
    RepositoryTooLong,
    #[msg("The ABC should be initialized set up.")]
    ABCNotSetUp,
    #[msg("The bounding curve parameters are not valid.")]
    WrongABCParams,
    #[msg("Unable to down cast number")]
    NumberDownCast,
    #[msg("Division by zero")] // 0x1775
    DivisionByZero,
    #[msg("The minimum amount is not reached.")]
    MinimumMintAmountNotReached,
}
