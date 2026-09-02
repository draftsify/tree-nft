// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/* ── the pieces of Uniswap v4 and Arbitrum this needs, declared locally ──
 *
 * Both are deployed infrastructure, not dependencies of this project, so only
 * the surface actually called is declared rather than pulling in the packages.
 */

type Currency is address;

struct PoolKey {
    Currency currency0;
    Currency currency1;
    uint24 fee;
    int24 tickSpacing;
    address hooks;
}

struct SwapParams {
    bool zeroForOne;
    int256 amountSpecified;
    uint160 sqrtPriceLimitX96;
}

interface IPoolManager {
    function unlock(bytes calldata data) external returns (bytes memory);
    function swap(PoolKey memory key, SwapParams memory params, bytes calldata hookData)
        external
        returns (int256 delta);
    function sync(Currency currency) external;
    function settle() external payable returns (uint256);
    function take(Currency currency, address to, uint256 amount) external;
}

/// @dev The Arbitrum precompile at 0x64. `withdrawEth` starts a withdrawal to
///      the parent chain; the ETH lands at `destination` on Ethereum once the
///      challenge period has passed and the outbox entry is executed.
interface IArbSys {
    function withdrawEth(address destination) external payable returns (uint256);
}

/**
 * @title ReforestationReserve
 * @notice Holds the reforestation share and moves it to the charity without
 *         anyone being able to send it anywhere else.
 *
 * The mint contract pays 60% of every mint here, and the Pons fee harvester
 * pays creator fees here. From this point the money has exactly one exit:
 *
 *   1. `swap()`   — sells $TREE for ETH in the Uniswap v4 pool.
 *   2. `bridge()` — hands the ETH to the Arbitrum bridge, addressed to the
 *                   charity on Ethereum. After the challenge period, anyone
 *                   can execute the outbox entry and the ETH lands there.
 *
 * Both are callable by anyone and neither takes a destination. There is no
 * owner, no withdraw, no rescue and no setter. Nothing here can be redirected,
 * which is the only reason it is safe to leave both calls open.
 *
 * The ETH is never held on Ethereum by anyone: the bridge is addressed to the
 * charity at the moment the withdrawal is started, and that address is written
 * into this contract at deployment and cannot be changed.
 *
 * ── on the swap being open to anyone ──
 *
 * A swap anyone can trigger invites a sandwich. Rather than a price oracle,
 * this uses the pool's own limit: `sqrtPriceFloorX96` is immutable, and v4
 * stops a swap at that price instead of trading through it. An attacker cannot
 * push the sale below the floor because the pool refuses; a partial fill leaves
 * the rest for the next call, and a price under the floor makes the swap
 * revert rather than sell into it. `maxSwapPerCall` bounds any one trade so a
 * single call cannot move the price far to begin with.
 *
 * This bounds the loss. It does not eliminate it. Between the floor and the
 * current price there is room to extract value, and the honest statement is
 * that the floor sets how much.
 */
contract ReforestationReserve is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IArbSys private constant ARB_SYS = IArbSys(0x0000000000000000000000000000000000000064);

    /// @notice The Uniswap v4 singleton on this chain.
    IPoolManager public immutable poolManager;

    /// @notice The token the mint is paid in, and the only token sold here.
    IERC20 public immutable paymentToken;

    /// @notice Where the bridged ETH lands on Ethereum. Immutable.
    address public immutable charity;

    /// @notice The pool this sells into, stored field by field because a
    ///         struct cannot be immutable.
    Currency public immutable currency0;
    Currency public immutable currency1;
    uint24 public immutable poolFee;
    int24 public immutable poolTickSpacing;
    address public immutable poolHooks;

    /// @notice The pool refuses to trade past this price, so a caller cannot
    ///         sell the reserve into a manipulated one.
    uint160 public immutable sqrtPriceFloorX96;

    /// @notice The most that can be sold in one call.
    uint256 public immutable maxSwapPerCall;

    /// @notice Running totals, so the site can show the route without anyone
    ///         typing a number into it.
    uint256 public totalSwapped;
    uint256 public totalBridged;

    event Swapped(address indexed caller, uint256 tokensSold, uint256 ethReceived);
    event Bridged(address indexed caller, uint256 amount, uint256 withdrawalId, address destination);

    error ZeroAddress();
    error NothingToSwap();
    error NothingToBridge();
    error SwapReturnedNothing();

    constructor(
        IPoolManager poolManager_,
        IERC20 paymentToken_,
        address charity_,
        PoolKey memory key_,
        uint160 sqrtPriceFloorX96_,
        uint256 maxSwapPerCall_
    ) {
        if (
            address(poolManager_) == address(0) ||
            address(paymentToken_) == address(0) ||
            charity_ == address(0) ||
            sqrtPriceFloorX96_ == 0 ||
            maxSwapPerCall_ == 0
        ) revert ZeroAddress();

        poolManager = poolManager_;
        paymentToken = paymentToken_;
        charity = charity_;

        currency0 = key_.currency0;
        currency1 = key_.currency1;
        poolFee = key_.fee;
        poolTickSpacing = key_.tickSpacing;
        poolHooks = key_.hooks;

        sqrtPriceFloorX96 = sqrtPriceFloorX96_;
        maxSwapPerCall = maxSwapPerCall_;
    }

    /// @dev ETH arrives from the pool and from the fee harvester.
    receive() external payable {}

    /* ── 1. sell ─────────────────────────────────────────── */

    /**
     * @notice Sell up to `maxSwapPerCall` of the reserve's $TREE for ETH.
     * @dev Permissionless. The proceeds cannot leave except through `bridge()`,
     *      so triggering this gains the caller nothing directly.
     */
    function swap() external nonReentrant returns (uint256 ethReceived) {
        uint256 balance = paymentToken.balanceOf(address(this));
        if (balance == 0) revert NothingToSwap();

        uint256 amountIn = balance > maxSwapPerCall ? maxSwapPerCall : balance;

        uint256 before = address(this).balance;
        poolManager.unlock(abi.encode(amountIn));
        ethReceived = address(this).balance - before;

        // A swap stopped dead at the floor returns nothing. Revert rather than
        // emit an empty entry into the public record.
        if (ethReceived == 0) revert SwapReturnedNothing();

        totalSwapped += ethReceived;
        emit Swapped(msg.sender, amountIn, ethReceived);
    }

    /// @dev Called back by the pool manager while the pool is unlocked.
    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        require(msg.sender == address(poolManager), "reserve: not the pool manager");
        uint256 amountIn = abi.decode(data, (uint256));

        PoolKey memory key = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: poolFee,
            tickSpacing: poolTickSpacing,
            hooks: poolHooks
        });

        // currency0 is ETH, currency1 is $TREE: selling $TREE is one-for-zero.
        int256 delta = poolManager.swap(
            key,
            SwapParams({
                zeroForOne: false,
                amountSpecified: -int256(amountIn),
                sqrtPriceLimitX96: sqrtPriceFloorX96
            }),
            ""
        );

        // BalanceDelta packs amount0 in the high 128 bits and amount1 in the
        // low ones. Negative means this contract owes the pool.
        int128 amount0 = int128(delta >> 128);
        int128 amount1 = int128(int256(uint256(delta) & type(uint128).max));

        // Pay what was actually taken, which a partial fill makes smaller than
        // amountIn.
        if (amount1 < 0) {
            uint256 owed = uint256(uint128(-amount1));
            poolManager.sync(currency1);
            paymentToken.safeTransfer(address(poolManager), owed);
            poolManager.settle();
        }

        if (amount0 > 0) {
            poolManager.take(currency0, address(this), uint256(uint128(amount0)));
        }

        return "";
    }

    /* ── 2. bridge, addressed to the charity ─────────────── */

    /**
     * @notice Start an Ethereum withdrawal of the whole ETH balance, addressed
     *         to the charity.
     * @dev Permissionless, and the destination is not a parameter. After the
     *      challenge period, roughly a week, anyone can execute the resulting
     *      outbox entry on Ethereum. Nobody custodies the ETH in between.
     */
    function bridge() external nonReentrant returns (uint256 withdrawalId) {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToBridge();

        totalBridged += amount;
        withdrawalId = ARB_SYS.withdrawEth{value: amount}(charity);

        emit Bridged(msg.sender, amount, withdrawalId, charity);
    }

    /* ── views, so a keeper can check before paying gas ──── */

    function pendingTokens() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }

    function pendingEth() external view returns (uint256) {
        return address(this).balance;
    }
}
