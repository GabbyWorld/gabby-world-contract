// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC1155Enumerable.sol";

contract Gabby1155 is Ownable, ERC1155Enumerable {
    using Address for address;
    using Strings for uint256;

    string private _name;
    string private _symbol;
    uint private _totalSupply;

    address public superMinter;
    string public baseTokenURI;
    mapping(address => mapping(uint => uint)) public minters;

    struct TokenInfo {
        uint256 tokenId;
        uint256 limit;
        uint256 supply;
        uint256 burned;
        string tokenURI;
    }

    mapping(uint => TokenInfo) public tokenInfoes;

    constructor(string memory __name, string memory __symbol, string memory _uri) ERC1155(_uri) {
        _name = __name;
        _symbol = __symbol;
        baseTokenURI = _uri;
    }

    function mint(address _to, uint _tokenId, uint _amount) public returns (bool) {
        _totalSupply += _amount;
        _spendQuota(_msgSender(), _tokenId, _amount);

        _mint(_to, _tokenId, _amount, "");
        return true;
    }

    function mintBatch(address _to, uint256[] memory _tokenIds, uint256[] memory _amounts) public returns (bool) {
        uint totalAmount = 0;
        for (uint i = 0; i < _tokenIds.length; i++) {
            _spendQuota(_msgSender(), _tokenIds[i], _amounts[i]);
        }
        _totalSupply += totalAmount;
        _mintBatch(_to, _tokenIds, _amounts, "");

        return true;
    }

    function burn(address _account, uint256 _tokenId, uint256 _amount) public override {
        require(_account == _msgSender() || isApprovedForAll(_account, _msgSender()), "G: caller is not owner nor approved");

        tokenInfoes[_tokenId].burned += _amount;
        _totalSupply -= _amount;

        _burn(_account, _tokenId, _amount);
    }

    function burnBatch(address _account, uint256[] memory _tokenIds, uint256[] memory _amounts) public override {
        require(_account == _msgSender() || isApprovedForAll(_account, _msgSender()), "G: caller is not owner nor approved");

        uint totalAmount = 0;
        for (uint i = 0; i < _tokenIds.length; ++i) {
            tokenInfoes[_tokenIds[i]].burned += _amounts[i];
            totalAmount += _amounts[i];
        }

        _totalSupply -= totalAmount;

        _burnBatch(_account, _tokenIds, _amounts);
    }

    /******************************* view function *******************************/

    function uri(uint256 _tokenId) public view override returns (string memory) {
        if (0 == tokenInfoes[_tokenId].tokenId) {
            return "";
        }
        return bytes(baseTokenURI).length > 0 ? string(abi.encodePacked(baseTokenURI, "/", tokenInfoes[_tokenId].tokenURI)) : "";
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /******************************* internal function *******************************/

    function _setQuota(address _spender, uint256 _tokenId, uint _amount) internal {
        minters[_spender][_tokenId] = _amount;
    }

    function _setSupply(uint256 _tokenId, uint _amount) internal {
        tokenInfoes[_tokenId].supply = _amount;
    }

    function _decreaseQuota(address _spender, uint256 _tokenId, uint256 _subtractedValue) internal {
        uint256 currentQuota = minters[_spender][_tokenId];

        require(currentQuota >= _subtractedValue, "G: decreased quota below zero");
        unchecked {
            minters[_spender][_tokenId] = currentQuota - _subtractedValue;
        }
        // TODO: event
    }

    function _spendQuota(address _spender, uint256 _tokenId, uint256 _amount) internal {
        require(_amount > 0, "G: missing amount");
        require(_tokenId != 0 && tokenInfoes[_tokenId].tokenId != 0, "G: wrong tokenId");

        uint256 currentAmount = tokenInfoes[_tokenId].supply;
        require(tokenInfoes[_tokenId].limit >= _amount + currentAmount, "G: Token is out of limit");

        unchecked {
            // Overflow not possible: currentAmount + _amount is at most _totalSupply + _amount, already checked.
            _setSupply(_tokenId, currentAmount + _amount);
        }

        if (_spender != superMinter) {
            uint256 currentQuota = minters[_spender][_tokenId];
            require(currentQuota >= _amount, "G: Token insufficient quota");

            unchecked {
                _setQuota(_spender, _tokenId, currentQuota - _amount);
            }
        }
    }

    /******************************* auth function *******************************/

    function setBaseTokenURI(string memory _uri) external onlyOwner {
        baseTokenURI = _uri;
    }

    function setSuperMinter(address newSuperMinter_) public onlyOwner {
        superMinter = newSuperMinter_;
    }

    function setMinter(address _spender, uint _tokenId, uint _amount) public onlyOwner {
        _setQuota(_spender, _tokenId, _amount);
    }

    function setMinterBatch(address _spender, uint[] calldata _tokenIds, uint[] calldata _amounts) public onlyOwner {
        require(_tokenIds.length > 0 && _tokenIds.length == _amounts.length, "token id and amounts length mismatch");
        for (uint i = 0; i < _tokenIds.length; ++i) {
            _setQuota(_spender, _tokenIds[i], _amounts[i]);
        }
    }
}
