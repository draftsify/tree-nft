// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPonsFeeEscrow {
    function balanceOf(address recipient) external view returns (uint256);
    function balanceOfToken(address recipient, address token) external view returns (uint256);
    function claim() external;
    function claimToken(address token) external;
}

/**
 * @title ReserveHarvester
 * @notice Pulls the project's accrued Pons fees and forwards them to the
 *         reforestation reserve.
 *
 * The Pons escrow pays whoever calls it: `claim()` credits `msg.sender`. So the
 * fee recipient is set to this contract rather than to a wallet, and the effect
 * is worth the extra deployment:
 *
 * - `harvest()` takes no arguments and is callable by anyone. Nobody has to be
 *   trusted to remember, and no key has to be online on a schedule. A bot, a
 *   cron job or a stranger can trigger it and the result is identical.
 * - The destination is immutable. Whoever calls, the funds can only land at
 *   `reserve`. Triggering a harvest gives the caller nothing, which is why it
 *   is safe to leave open.
 *
 * This covers the first hop of the donation route. The swap and the bridge that
 * follow it are not on-chain here and are not pretended to be.
 */
contract ReserveHarvester is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The Pons fee escrow this contract claims from.
    IPonsFeeEscrow public immutable escrow;

    /// @notice Where everything harvested goes. Immutable, so an open
    ///         `harvest()` cannot be turned into a withdrawal by anyone.
    address public immutable reserve;

    event Harvested(address indexed caller, uint256 nativeAmount);
    event HarvestedToken(address indexed caller, address indexed token, uint256 amount);

    error ZeroAddress();
    error NothingToHarvest();
    error TransferFailed();

    constructor(IPonsFeeEscrow escrow_, address reserve_) {
        if (address(escrow_) == address(0) || reserve_ == address(0)) {
            revert ZeroAddress();
        }
        escrow = escrow_;
        reserve = reserve_;
    }

    /// @dev The escrow pays native fees by transfer, so this must accept them.
    receive() external payable {}

    /**
     * @notice Claim accrued native fees and forward them to the reserve.
     * @dev Deliberately permissionless. Reverts when there is nothing to claim
     *      so that a keeper calling on a timer does not burn gas on no-ops.
     */
    function harvest() public nonReentrant returns (uint256 amount) {
        amount = escrow.balanceOf(address(this));
        if (amount == 0) revert NothingToHarvest();

        escrow.claim();

        // Forward the whole balance rather than the claimed figure, so any
        // native dust already sitting here leaves with it instead of building
        // up in a contract nobody watches.
        uint256 balance = address(this).balance;
        (bool ok, ) = reserve.call{value: balance}("");
        if (!ok) revert TransferFailed();

        emit Harvested(msg.sender, balance);
    }

    /**
     * @notice Claim accrued fees in one ERC-20 and forward them to the reserve.
     * @param token The fee asset to claim, typically the launch token itself.
     */
    function harvestToken(address token) public nonReentrant returns (uint256 amount) {
        amount = escrow.balanceOfToken(address(this), token);
        if (amount == 0) revert NothingToHarvest();

        escrow.claimToken(token);

        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(reserve, balance);

        emit HarvestedToken(msg.sender, token, balance);
    }

    /**
     * @notice Harvest native fees and a list of tokens in one call.
     * @dev Skips whatever has nothing pending instead of reverting the batch,
     *      so a keeper can call this on a fixed schedule without knowing which
     *      assets happen to have accrued.
     */
    function harvestAll(address[] calldata tokens) external {
        if (escrow.balanceOf(address(this)) > 0) harvest();

        for (uint256 i = 0; i < tokens.length; ++i) {
            if (escrow.balanceOfToken(address(this), tokens[i]) > 0) {
                harvestToken(tokens[i]);
            }
        }
    }

    /* ── views, so a keeper can check before paying gas ── */

    function pendingNative() external view returns (uint256) {
        return escrow.balanceOf(address(this));
    }

    function pendingToken(address token) external view returns (uint256) {
        return escrow.balanceOfToken(address(this), token);
    }
}
