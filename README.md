# backend-ose

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
