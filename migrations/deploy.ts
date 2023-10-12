// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import Provider from "@coral-xyz/anchor/dist/cjs/provider";

const anchor = require("@coral-xyz/anchor");

module.exports = async function (provider: Provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.

  // for now:
  // solana program deploy -u devnet -k /Users/laurianemollier/.config/solana/id.json target/deploy/poc.so
};
