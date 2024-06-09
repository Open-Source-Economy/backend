// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



/**
* Adjustable token where limit supply can be upgradable. 
*
* Exemple of deployment:
* 
* bytecode = '0x...'
* const args = [
*      "OSE-test-1", 
*      "OSET1",         // Symbol (ticker)
*      1000000,         // Initial supply
*      10000000        // Maximum supply
* ];
*
* const result = await deploy(bytecode, args) 
*
*/
contract AdjustableSupplyToken is ERC20, Ownable(msg.sender)  {
    uint256 public maxSupply;

    constructor(string memory name, string memory symbol, uint256 initialSupply, uint256 _maxSupply) ERC20(name, symbol) {
        require(initialSupply <= _maxSupply, "Initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
        maxSupply = _maxSupply;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Minting exceeds max supply");
        _mint(to, amount);
    }

    function updateMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply is less than current total supply");
        maxSupply = newMaxSupply;
    }
}