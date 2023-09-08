// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "contracts/utils/Minter.sol";
import "contracts/utils/TBA.sol";
import "contracts/utils/Gabby721.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "contracts/utils/SigUtils.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Gabby is Gabby721, Minter, SigUtils, TBA {
    using Counters for Counters.Counter;

    struct TokenInfo {
        bool sex;
        uint256 age;
        uint256 birthday;
        string name;
    }

    Counters.Counter private _tokenIds;

    bool public transferEmable;
    mapping(uint256 => TokenInfo) public tokenInfoes;

    event Mint(uint256 indexed tokenId, address indexed account, address indexed tba, bool sex, uint256 age, string name);

    constructor(string memory name_, string memory symbol_, string memory baseURI_) Gabby721(name_, symbol_, baseURI_) {
        setSuperMinter(_msgSender());
        setERC6551Registry(0x02101dfB77FDE026414827Fdc604ddAF224F0921);
        setERC6551Implementation(0x2D25602551487C3f3354dD80D76D54383A243358);
    }

    function _afterTokenTransfer(address, address to, uint256 firstTokenId, uint256) internal virtual override {
        if (to == address(0)) {
            delete tokenInfoes[firstTokenId];
            return;
        }

        if (!transferEmable) {
            require(balanceOf(to) > 0, "G:limit");
        }
    }

    function mint(address to_, bool sex_, uint256 age_, string memory name_) public onlyMinter(1) returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _spendQuota(1);

        tokenInfoes[tokenId] = TokenInfo({ sex: sex_, age: age_, birthday: block.timestamp, name: name_ });

        // calculate ERC6551 account address
        // address tba = erc6551Registry.account(erc6551AccountImplementation, block.chainid, address(this), tokenId, 0);

        address tba = _create6551Account(tokenId, 0, "");
        _mint(to_, tokenId);

        emit Mint(tokenId, to_, tba, sex_, age_, name_);
        return tokenId;
    }

    function setTransferEmable(bool enable_) external onlyOwner {
        transferEmable = enable_;
    }
}
