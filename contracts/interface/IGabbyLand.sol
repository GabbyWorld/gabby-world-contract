// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IGabbyLand is IERC721 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function mint(address to, uint256 location, uint256 index, uint256 masterpieceId, address guard, string memory style, string memory description) external returns (uint256);

    // function createMinPrompt(uint256 tokenId) external view returns (uint256);
}
