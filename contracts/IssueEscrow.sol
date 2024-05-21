pragma solidity ^0.8.0;

// Importing IERC20 and Strings from OpenZeppelin's contract library
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//// NOTE: payer -> funder
//// NOTE: payee -> maintainer
//// NOTE: escrowAgent -> OSE
//// TODO: Use Diamond Pattern (https://eips.ethereum.org/EIPS/eip-2535)
contract IssueEscrow {
    // The agent that will be responsible for sending the funds to the contributors that have fixed the issue
    address public escrowAgent;
    // Address of the ERC20 token contract that will be used for funding the issues
    address public fundingCurrencyAddress;
    // Track funding for each issue
    mapping(string => uint256) public issuesFunding;

    constructor() {
        escrowAgent = msg.sender;
        fundingCurrencyAddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // Default to USDC on Ethereum Mainnet
    }

    modifier onlyEscrowAgent() {
        require(msg.sender == escrowAgent, "Only the escrow agent can perform this action");
        _;
    }

    // Allows the escrowAgent to update the USDC token address
    function setFundingCurrencyAddress(address _fundingCurrencyAddress) public onlyEscrowAgent {
        require(fundingCurrencyAddress != address(0), "The funding currency address cannot be the zero address");
        fundingCurrencyAddress = _fundingCurrencyAddress;
    }

    // Fund an issue based on owner, repository, and issue number
    function fundIssue(string memory owner, string memory repository, uint16 number, uint256 amount) public {
        require(amount != 0, "Token amount cannot be 0");
        string memory issueKey = generateIssueKey(owner, repository, number);

        IERC20 fundingCurrency = IERC20(fundingCurrencyAddress);

        require(
            fundingCurrency.transferFrom(msg.sender, address(this), amount),
            string(abi.encodePacked("Transfer of the funding amount failed. Address: ", fundingCurrencyAddress, ", Amount: ", Strings.toString(amount)))
        );

        issuesFunding[issueKey] += amount;
    }

    // Send funds to the contributors that have fixed the issue
    function sendToContributor(string memory owner, string memory repository, uint16 number, address repoMaintainerAddress) public onlyEscrowAgent {
        string memory issueKey = generateIssueKey(owner, repository, number);
        uint256 payment = issuesFunding[issueKey];
        require(payment > 0, "No funds to send");

        IERC20 fundingCurrency = IERC20(fundingCurrencyAddress);
        require(fundingCurrency.transfer(repoMaintainerAddress, payment), "Transfer of USDC failed");

        issuesFunding[issueKey] = 0;
    }

    // Get the total amount deposited for a specific issue
    function getIssueAmount(string memory owner, string memory repository, uint16 number) public view returns (uint256) {
        string memory issueKey = generateIssueKey(owner, repository, number);
        return issuesFunding[issueKey];
    }

    function getEscrowAgent() public view returns (address) {
        return escrowAgent;
    }

    // Private helper function to generate a unique key for each issue
    function generateIssueKey(string memory owner, string memory repository, uint16 number) private pure returns (string memory) {
        return string(abi.encodePacked(owner, "/", repository, "/", Strings.toString(number)));
    }
}