# Introduction

Congratulations, you've stumbled upon Open-Source-Economy POC— the future of open-source competitiveness.

[Live website link](https://frontend-alpha-umber.vercel.app/)

Deployed only DevNet

The default and only asset to exchange for toke right now is devUSDC of mint `BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k`
Mint them [here](https://everlastingsong.github.io/nebula/)

# Disclaimer

```diff
-This is still just a POC. Tests and feedback will go a long way.
-However, for the love of open-source, please do not use it to attract funds or fund projects as it is not yet ready for that.
```

# What is Open-Source-Economy?

Open-Source-Economy (OSE) is an open-source marketplace aiming to disrupt the current imbalance with closed software by bringing more funding to our ecosystem.

Our marketplace bridges the gap between all open-source actors:

    Maintainers: Responsible for software quality and project development.

    Contributors: Submit code upgrades.

    Users: Utilize an open-source program.

    Backers: Fund open-source projects.

Each open-source project can easily create its own token, allowing all the actors around them to easily exchange value, and bringing more funding to the ecosystem.

[Read more about OSE](https://blog.open-source-economy.com/make-open-source-finally-work-c8ab46fcc331)

## Manual

Here's how to identify yourself, register a project, create its token, select a project, donate, or swap project tokens.

### Connect a Wallet

Start on the home page — the hub of our marketplace.

Connect a Phantom wallet to identify yourself. If you don't have one, you can download the Phantom browser wallet at: https://phantom.app/download

We are currently running on the Solana testnet; use your wallet accordingly.

### Project Registration

#### Action

Prerequisite:

    Connect a wallet

To register a project on our marketplace, navigate to our home page: TODO

Press "Register a Project" and enter:

    Owner: The GitHub project owner's name.

    Repository: The name of the project repository on GitHub.

Example : in this page : https://github.com/facebook/react
the Owner is `Facebook` and Repository is `React`

#### Specification

Once submitted, two IDL functions are called:

```rust
pub fn initialize(
        ctx: Context<Initialize>,
        owner: String, // project owner
        repository: String, // repository name
        project_bump: u8,
    ) -> Result<()>
```

Anyone can register a project; you just need the owner and repository name.

```rust
pub fn set_up_abc(
    ctx: Context<SetUpABC>,
    constant_mint: u64, //project token mint price
    constant_redeem: u64, //project token redeem price
    ) -> Result<()>
```

Currently, we only support a flat curve. The augmented bonding curve is yet to be implemented. Users get an automatic and constant minting and redeeming price.

The quote asset is devUSDC, it will be the currency use to buy and sell project tokens.

```diff
-Disclaimer
- devUSD public key is : BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k
- Do not buy different ones if you wish to interact with our smartcontracts
```

_We aim to allow projects to customize these parameters in the near future._

#### Result

Once registered, your project will appear alongside others on the home page.

### Donation

#### Action

Donate to a project you want to support

Prerequisites:

    1. Connected wallet
    2. Project you want to support is already registered

Click on a project on the home page to arrive at the project page. In addition to project metrics, you'll see a panel with two options: donate and swap.

Select "Donate" and enter the amount you wish to give.

#### Specification

Once submitted an IDL function is called -

```rust
    // abc does not have to be set up
    pub fn donate(ctx: Context<Donate>,
     quote_amount: u64 //amount of assets to be donated
     ) -> Result<()>
```

Donations must be made in the asset the project operates with, which in this poc is devUSDC.

```diff
-Disclaimer
- devUSD public key is : BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k
- Do not buy different ones if you wish to interact with our smartcontracts
```

_We aim to offer more choices in donation currencies in the near future._

#### Result

Upon completion, the donation will be converted to the project token, which the project will receive.

![Alt text](<Screenshot 2023-10-15 162002.png>)

### Swap

#### Action

Prerequisites:

    1. Connected wallet
    2. Project you want to support is already registered

To mint or redeem a token, press the "Swap" option on the project panel.

Enter the amount you wish to swap; for now, you must use the project's attributed asset.

`minting` - Two options to **get** project tokens:

    1. Enter the desired amount of devUSDC you wish to pay in the upper panel (labeled "You Pay").

    2. Enter the desired number of project tokens you wish to receive in the lower panel (labeled "You Get").

`Redeeming` - Two options to **sell** project tokens:

    1. Enter the desired number of project tokens you wish to sell in the upper panel (labeled "You Pay").

    2. Enter the desired amount of devUSDC you wish to receive in the lower panel (labeled "You Get").

#### Specification

Minting and redeeming call two different IDL functions:

Minting:

```rust
 pub fn mint_project_token(
        ctx: Context<MintProjectToken>,
        min_project_token_amount: u64, //Minimum amount of project tokens you can get
        quote_amount: u64,//amount of paid devUSDC
    ) -> Result<()
```

Redeeming:

```rust
 pub fn redeem_project_token(
        ctx: Context<RedeemProjectToken>,
        project_token_amount: u64, //amount of paid project tonkens
        min_quote_amount: u64, // Minimal amount of devUSDC to get
    ) -> Result<()>
```

Like in "Donate," the asset you use for redeeming and minting is the one **attributed** upon project registration - devUSDC.

```diff
-Disclaimer
- devUSD public key is : BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k
- Do not buy different ones if you wish to interact with our smartcontracts
```

_We aim to offer more choices in swap currencies in the future._

#### Result

If you've minted, you will receive the project tokens in your wallet.

If you've redeemed, you will receive devUSDC in your wallet.

# Development

## Formatting

```shell
# Rust
cargo fmt
# Typescript
npx prettier --write .
```

## Run on localnet

- Smart contract integration tests: `anchor test --detach`. Then you can browse the transactions [here](https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899)

## Run test

```shell
anchor test
```

If you want to run on a local network, you can use the following command:

```shell
solana-test-validator -r
anchor test --skip-local-validator
```

Anchor errors code:
https://anchor.so/errors

Anchor cli:
https://www.anchor-lang.com/docs/cli

# Ethereum

## Hardhat Project

### Run local (stand-alone) blockchain

Alternatively, Hardhat Network can run in a stand-alone fashion so that external clients can connect to it. This could be a wallet, your Dapp front-end, or a script. To run Hardhat Network in this way, run:

This will start Hardhat Network, and expose it as a JSON-RPC and WebSocket server.

Then, just connect your wallet or application to http://127.0.0.1:8545
If you want to connect Hardhat to this node, you just need to run using `--network localhost`.

```shell
npx hardhat node
```

### Compile Contract

```shell
npx hardhat compile
```

### Run Tests

```shell
npx hardhat test
```

### Deploy Contract with deploy

```shell
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```

### Deploy Contract with run

```shell
npx hardhat run scripts/deploy.ts --network localhost
```

## Linter

Run linter

```shell
npm run solhint
```
