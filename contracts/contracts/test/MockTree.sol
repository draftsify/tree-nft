// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Stands in for $TREE in the test suite. Not deployed.
contract MockTree is ERC20 {
    constructor() ERC20("Tree Token", "TREE") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
