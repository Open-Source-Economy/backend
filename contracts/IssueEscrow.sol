// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// NOTE: payer -> funder
// NOTE: payee -> maintainer
// NOTE: escrowAgent -> OSE
// TODO: Use Diamond Pattern (https://eips.ethereum.org/EIPS/eip-2535)
contract IssueEscrow {
    address payable public escrowAgent;
    mapping(string => uint256) public issuesDeposits;

    modifier onlyAgent() {
        require(msg.sender == escrowAgent, 'only the escrow agent can do this action');
        _;
    }

    constructor() {
        escrowAgent = payable(msg.sender);
    }

    // TODO: the escrowAgent pays the fees in place of the funder
    function fundIssue(string memory gitIssueURL) public payable {
        uint256 amount = msg.value;
        require(amount != 0, 'escrow amount cannot be equal to 0');
        issuesDeposits[gitIssueURL] = issuesDeposits[gitIssueURL] + amount;
    }

    // TODO: Don't send directly to mantainer
    // TODO: Delegate to mantainer the ability to decides the shares and then send to them.
    function sendToMantainer(
        string memory gitIssueURL,
        address payable repoMantainerAddress
    ) public onlyAgent {
        uint256 payment = issuesDeposits[gitIssueURL];
        issuesDeposits[gitIssueURL] = 0;
        repoMantainerAddress.transfer(payment);
    }

    function getIssueAmount(string memory gitIssueURL) public view returns (uint256 issueDeposit) {
        return issuesDeposits[gitIssueURL];
    }

    function getEscrowAgent() public view returns (address payable) {
        return escrowAgent;
    }
}
