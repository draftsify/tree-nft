// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Stands in for the Pons fee escrow in tests. Not deployed.
contract MockEscrow {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) private _tokenBalances;

    receive() external payable {}

    function credit(address recipient) external payable {
        balanceOf[recipient] += msg.value;
    }

    function creditToken(address recipient, address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        _tokenBalances[recipient][token] += amount;
    }

    function balanceOfToken(address recipient, address token) external view returns (uint256) {
        return _tokenBalances[recipient][token];
    }

    function claim() external {
        uint256 amount = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "escrow: native transfer failed");
    }

    function claimToken(address token) external {
        uint256 amount = _tokenBalances[msg.sender][token];
        _tokenBalances[msg.sender][token] = 0;
        IERC20(token).transfer(msg.sender, amount);
    }
}
