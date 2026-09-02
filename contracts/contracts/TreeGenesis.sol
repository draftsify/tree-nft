// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Tree — Genesis Forest
 * @notice A collectible ERC-721 whose mint revenue is split inside the minting
 *         transaction itself.
 *
 * Three properties are enforced by this contract rather than by policy, which
 * is the point of the project:
 *
 * 1. The donation recipient is immutable. Nobody, including the owner, can
 *    redirect the reforestation share after deployment. Verify the address
 *    before deploying, because it can never be changed.
 *
 * 2. The split happens in the mint call. There is no treasury holding funds and
 *    no later transfer to trust: one mint produces one transfer to the
 *    recipient, in the same transaction, visible to anyone reading the chain.
 *
 * 3. Stage is a pure function of how much the collection has donated. No owner
 *    call advances a token. Because the donations are anonymous, no partner can
 *    confirm planting back to us, so a stage that depended on such a report
 *    would never unlock honestly. This one is derivable from chain state alone.
 */
contract TreeGenesis is ERC721, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    /* ── fixed at deployment ─────────────────────────── */

    uint256 public constant MAX_SUPPLY = 1_000;
    uint256 public constant MAX_PER_WALLET = 5;

    /// @notice Share of each mint forwarded to the recipient, in basis points.
    uint256 public constant DONATION_BPS = 6_000;

    /// @notice Where the reforestation share goes. Immutable by design.
    address payable public immutable donationRecipient;

    /// @notice Where the remainder goes. Immutable, so the split cannot drift.
    address payable public immutable treasury;

    /// @notice keccak256 of the ordered metadata manifest, committed before any
    ///         mint so the artwork order cannot be rearranged afterwards.
    bytes32 public immutable provenanceHash;

    /// @notice Cumulative donation, in wei, at which each stage unlocks.
    uint256 public immutable stage2Threshold;
    uint256 public immutable stage3Threshold;
    uint256 public immutable stage4Threshold;

    /* ── mutable, and deliberately few ───────────────── */

    uint256 public mintPrice;
    bool public mintOpen;
    uint256 public totalMinted;

    /// @notice Total wei forwarded to the recipient by this contract.
    uint256 public totalDonated;

    /// @notice Offset applied to the tokenId → artwork mapping, drawn once at
    ///         reveal so that neither minters nor the deployer can know which
    ///         composition a token id will receive.
    uint256 public startingIndex;
    bool public startingIndexSet;

    string private _baseTokenURI;
    string private _unrevealedURI;
    bool public metadataFrozen;

    /* ── events ──────────────────────────────────────── */

    event Minted(address indexed to, uint256 indexed tokenId, uint256 pricePaid);
    event Donated(address indexed recipient, uint256 amount, uint256 cumulative);
    event MintPriceSet(uint256 price);
    event MintOpenSet(bool open);
    event StartingIndexSet(uint256 index);
    event BaseURISet(string uri);
    event MetadataFrozen();

    /* ── errors ──────────────────────────────────────── */

    error MintClosed();
    error InvalidQuantity();
    error SupplyExhausted();
    error WalletLimitReached();
    error WrongPayment(uint256 expected, uint256 sent);
    error DonationFailed();
    error TreasuryFailed();
    error MetadataIsFrozen();
    error AlreadySet();
    error ZeroAddress();
    error NothingToSweep();

    constructor(
        address payable donationRecipient_,
        address payable treasury_,
        uint256 mintPrice_,
        bytes32 provenanceHash_,
        uint256[3] memory stageThresholds_,
        string memory unrevealedURI_,
        address royaltyReceiver_,
        uint96 royaltyBps_
    ) ERC721("Tree Genesis Forest", "TREE") Ownable(msg.sender) {
        if (donationRecipient_ == address(0) || treasury_ == address(0)) {
            revert ZeroAddress();
        }
        donationRecipient = donationRecipient_;
        treasury = treasury_;
        mintPrice = mintPrice_;
        provenanceHash = provenanceHash_;
        stage2Threshold = stageThresholds_[0];
        stage3Threshold = stageThresholds_[1];
        stage4Threshold = stageThresholds_[2];
        _unrevealedURI = unrevealedURI_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBps_);
        emit MintPriceSet(mintPrice_);
    }

    /* ── minting ─────────────────────────────────────── */

    /**
     * @notice Mint `quantity` tokens and forward the reforestation share in the
     *         same transaction.
     * @dev Payment is exact. Sending more reverts rather than being kept, so a
     *      mistyped value cannot silently become a donation the sender did not
     *      intend.
     */
    function mint(uint256 quantity) external payable nonReentrant {
        if (!mintOpen) revert MintClosed();
        if (quantity == 0) revert InvalidQuantity();
        if (totalMinted + quantity > MAX_SUPPLY) revert SupplyExhausted();
        if (balanceOf(msg.sender) + quantity > MAX_PER_WALLET) {
            revert WalletLimitReached();
        }

        uint256 due = mintPrice * quantity;
        if (msg.value != due) revert WrongPayment(due, msg.value);

        uint256 firstId = totalMinted + 1;
        totalMinted += quantity;

        for (uint256 i = 0; i < quantity; ++i) {
            uint256 tokenId = firstId + i;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId, mintPrice);
        }

        // The split, in this transaction. Effects are already recorded above,
        // and the reentrancy guard covers the external calls below.
        uint256 donation = (due * DONATION_BPS) / 10_000;
        uint256 remainder = due - donation;

        totalDonated += donation;
        emit Donated(donationRecipient, donation, totalDonated);

        (bool donationOk, ) = donationRecipient.call{value: donation}("");
        if (!donationOk) revert DonationFailed();

        (bool treasuryOk, ) = treasury.call{value: remainder}("");
        if (!treasuryOk) revert TreasuryFailed();
    }

    /* ── stage, derived not decreed ──────────────────── */

    /**
     * @notice The growth stage shared by every token, from 1 (Seed) to 4
     *         (Mature Tree).
     * @dev A pure read of `totalDonated`. There is no setter, so no key can
     *      advance a token and no report is required for one to grow.
     */
    function stage() public view returns (uint8) {
        uint256 donated = totalDonated;
        if (donated >= stage4Threshold) return 4;
        if (donated >= stage3Threshold) return 3;
        if (donated >= stage2Threshold) return 2;
        return 1;
    }

    /// @notice Stage of a specific token. Every token shares the collection's
    ///         stage: the forest grows together.
    function stageOf(uint256 tokenId) external view returns (uint8) {
        _requireOwned(tokenId);
        return stage();
    }

    /// @notice Wei still needed to reach the next stage, or 0 at stage 4.
    function toNextStage() external view returns (uint256) {
        uint8 s = stage();
        if (s == 1) return stage2Threshold - totalDonated;
        if (s == 2) return stage3Threshold - totalDonated;
        if (s == 3) return stage4Threshold - totalDonated;
        return 0;
    }

    /* ── metadata ────────────────────────────────────── */

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!startingIndexSet) return _unrevealedURI;

        // The offset is what stops a minter from choosing a composition: token
        // ids are sequential, but the artwork they resolve to is rotated by a
        // value nobody knows until the reveal.
        uint256 artworkIndex = (tokenId + startingIndex) % MAX_SUPPLY;
        return
            string.concat(
                _baseTokenURI,
                artworkIndex.toString(),
                "/",
                uint256(stage()).toString(),
                ".json"
            );
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        if (metadataFrozen) revert MetadataIsFrozen();
        _baseTokenURI = uri;
        emit BaseURISet(uri);
    }

    /// @notice Permanently give up the ability to change the metadata pointer.
    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
        emit MetadataFrozen();
    }

    /**
     * @notice Draw the artwork offset. Callable once, and only after the
     *         collection has sold out, so the value cannot be chosen to suit a
     *         mint that has not happened yet.
     */
    function setStartingIndex() external {
        if (startingIndexSet) revert AlreadySet();
        if (totalMinted < MAX_SUPPLY) revert SupplyExhausted();

        uint256 index = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.prevrandao,
                    totalDonated
                )
            )
        ) % MAX_SUPPLY;

        // Zero would leave the mapping unshifted, which is the one value that
        // would let a reader assume tokenId equals artwork index.
        if (index == 0) index = 1;

        startingIndex = index;
        startingIndexSet = true;
        emit StartingIndexSet(index);
    }

    /* ── administration ──────────────────────────────── */

    function setMintPrice(uint256 price) external onlyOwner {
        mintPrice = price;
        emit MintPriceSet(price);
    }

    function setMintOpen(bool open) external onlyOwner {
        mintOpen = open;
        emit MintOpenSet(open);
    }

    /// @dev Transfers are never pausable. If this project stops operating,
    ///      holders keep full control of their tokens.
    function setDefaultRoyalty(address receiver, uint96 bps) external onlyOwner {
        _setDefaultRoyalty(receiver, bps);
    }

    /**
     * @notice Forward any ETH that reached this contract outside `mint`.
     * @dev The mint path leaves no balance behind, so this only ever moves
     *      stray transfers. It sends them to the donation recipient rather than
     *      to the treasury, so there is no incentive to route funds here.
     */
    function sweepToDonation() external nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToSweep();

        totalDonated += balance;
        emit Donated(donationRecipient, balance, totalDonated);

        (bool ok, ) = donationRecipient.call{value: balance}("");
        if (!ok) revert DonationFailed();
    }

    /* ── views used by the interface ─────────────────── */

    function totalSupply() external view returns (uint256) {
        return totalMinted;
    }

    function remaining() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }

    function mintedBy(address account) external view returns (uint256) {
        return balanceOf(account);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
