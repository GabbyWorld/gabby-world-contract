// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

contract MarkleProoof is Ownable {
    using BitMaps for BitMaps.BitMap;

    bytes32 public root;
    BitMaps.BitMap private _claimedBitMap;

    function setMerkleRoot(bytes32 _root) external onlyOwner {
        root = _root;
    }

    function isClaimed(uint256 _index) public view returns (bool) {
        return _claimedBitMap.get(_index);
    }

    function _setClaimed(uint256 _index) private {
        _claimedBitMap.set(_index);
    }

    function verify(address _account, uint _amount, uint256 _index, bytes32[] calldata _proofs) public view returns (bool) {
        return MerkleProof.verify(_proofs, root, keccak256(abi.encodePacked(_account, _index, _amount)));
    }

    function claim(address _account, uint _amount, uint256 _index, bytes32[] calldata _proofs) public {
        require(verify(_account, _amount, _index, _proofs), "error sign");
        require(!isClaimed(_index), "merkle: already claimed.");

        _setClaimed(_index);
    }
}
