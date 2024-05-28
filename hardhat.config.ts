import '@nomicfoundation/hardhat-toolbox';

require("dotenv").config();

module.exports = {
    solidity: "0.8.26",
    networks: {
        arbitrum: {
            url: process.env.RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
};
