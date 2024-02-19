// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "erc6551/src/interfaces/IERC6551Registry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract TBA is Ownable {
    IERC6551Registry private _erc6551Registry;
    address private _erc6551AccountImplementation;

    // constructor(address erc6551Registry_, address erc6551AccountImpl_) {
    //     _erc6551Registry = IERC6551Registry(erc6551Registry_);
    //     _erc6551AccountImplementation = erc6551AccountImpl_;
    // }

    function erc6551Registry() public view returns (address) {
        return address(_erc6551Registry);
    }

    function erc6551AccountImplementation() public view returns (address) {
        return _erc6551AccountImplementation;
    }

    function erc6551Account(uint256 tokenId) public view returns (address) {
        return _erc6551Registry.account(_erc6551AccountImplementation, block.chainid, address(this), tokenId, 0);
    }

    function _create6551Account(uint256 tokenId, uint256 seed, bytes memory initData) internal returns (address) {
        return _erc6551Registry.createAccount(_erc6551AccountImplementation, block.chainid, address(this), tokenId, seed, initData);
    }

    function setERC6551Registry(address registry) public {
        _erc6551Registry = IERC6551Registry(registry);
    }

    function setERC6551Implementation(address implementation) public {
        _erc6551AccountImplementation = implementation;
    }
}
