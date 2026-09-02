// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUnlockCallback {
    function unlockCallback(bytes calldata data) external returns (bytes memory);
}

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

/**
 * @dev Stands in for the Uniswap v4 singleton. Not deployed.
 *
 * It reproduces the parts the reserve depends on and nothing else: the unlock
 * callback, a delta packed the way v4 packs it, and a fill that can be made
 * partial or empty so the price floor can be exercised without a real pool.
 */
contract MockPoolManager {
    /// @dev Wei of ETH returned per whole token sold, 18 decimals.
    uint256 public rate = 1e15;

    /// @dev Fraction of the requested input actually filled, in basis points.
    ///      Below 10_000 this stands for a swap stopped at the price floor.
    uint256 public fillBps = 10_000;

    uint256 public owedToPool;
    address public lastTaker;
    uint160 public lastPriceLimit;
    bool public lastZeroForOne;

    receive() external payable {}

    function setRate(uint256 rate_) external {
        rate = rate_;
    }

    function setFillBps(uint256 bps) external {
        fillBps = bps;
    }

    function unlock(bytes calldata data) external returns (bytes memory) {
        return IUnlockCallback(msg.sender).unlockCallback(data);
    }

    function swap(PoolKey memory, SwapParams memory params, bytes calldata)
        external
        returns (int256)
    {
        lastPriceLimit = params.sqrtPriceLimitX96;
        lastZeroForOne = params.zeroForOne;

        uint256 requested = uint256(-params.amountSpecified);
        uint256 filled = (requested * fillBps) / 10_000;
        uint256 out = (filled * rate) / 1e18;

        owedToPool = filled;

        // BalanceDelta: amount0 high, amount1 low. Positive is owed to the
        // caller, negative is owed by it.
        return (int256(int128(int256(out))) << 128) |
            int256(uint256(uint128(-int128(int256(filled)))));
    }

    function sync(Currency) external {}

    function settle() external payable returns (uint256) {
        uint256 paid = owedToPool;
        owedToPool = 0;
        return paid;
    }

    function take(Currency currency, address to, uint256 amount) external {
        lastTaker = to;
        if (Currency.unwrap(currency) == address(0)) {
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "mock: eth take failed");
        } else {
            IERC20(Currency.unwrap(currency)).transfer(to, amount);
        }
    }
}

/// @dev Stands in for the Arbitrum precompile at 0x64. Its runtime code is
///      copied to that address in the tests.
contract MockArbSys {
    event WithdrawalRequested(address indexed destination, uint256 amount, uint256 id);

    uint256 public nextId = 7_000;

    function withdrawEth(address destination) external payable returns (uint256) {
        uint256 id = nextId++;
        emit WithdrawalRequested(destination, msg.value, id);
        return id;
    }
}
