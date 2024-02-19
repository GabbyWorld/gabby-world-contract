// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IGabbyPrompt1155 is IERC1155 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function burn(address _account, uint256 _amount) external;
}
