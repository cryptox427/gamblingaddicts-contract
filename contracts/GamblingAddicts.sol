// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat/console.sol";

contract GamblingAddicts is ERC721Enumerable, ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;
    using SafeMath for uint16;
    using SafeMath for uint8;
    uint16 private _tokenId;

    address treasuryWallet = 0x167a8ED26D099E83E7FCf3Ea3CBE2895D3Ff22dA;

    uint16 public mintLimit = 777;
    uint16 public presaleMintLimit = 0;

    uint public presalePrice = 0 ether;  // 0 ether
    uint public mintPrice = 0.007 ether;         // 0.007 ether

    uint public presaleStartTime;
    uint public publicSaleStartTime;

    string private realBaseURI = "https://gateway.pinata.cloud/ipfs/Qmd4eJHxokHKnaYPBXFC7ETwCx8NwQDgFDiSUPuip99Atk/";
    string private virtualURI = "https://placeholder.com/";

    mapping(address => uint8) addressPresaleCountMap;     // Up to presaleMintLimit
    mapping(address => uint8) addressPublicSaleCountMap;       // Up to mintLimit

    mapping(uint => string) tokenURIMap;

    constructor() ERC721("GamblingAddicts", "GA") {
    }

    event Mint (address indexed _from,
        uint _tokenId,
        uint _mintPrice,
        uint timestamp
        );


    function mintPresale(uint8 _mintCount) external payable nonReentrant whenNotPaused returns (uint256) {
        require(_mintCount > 0, "Wrong amount");
        require(msg.sender != address(0), "Wrong address");
        require(block.timestamp >= presaleStartTime, "Presale is not on");
        require(msg.value == (presalePrice * _mintCount));
        require(totalSupply() + _mintCount <= presaleMintLimit, "Mint limit exceed");

        for (uint8 i = 0; i < _mintCount; i++) {
            _tokenId++;
            _safeMint(msg.sender, _tokenId);
        }

        addressPresaleCountMap[msg.sender] += _mintCount;

        emit Mint(
            msg.sender,
            _tokenId,
            presalePrice,
            block.timestamp
        );

        return _tokenId;
    }

    function mintPublic(uint8 _mintCount) external payable nonReentrant whenNotPaused returns (uint256) {
        require(block.timestamp >= publicSaleStartTime, "Public sale is not on");
        require(msg.sender != address(0), "Wrong address");
        require(msg.value == (mintPrice * _mintCount), "Incorrect the send price");
        require(totalSupply() + _mintCount <= mintLimit, "Mint limit exceed");

        for (uint8 i = 0; i < _mintCount; i++) {
            _tokenId++;
            _safeMint(msg.sender, _tokenId);
        }

        addressPublicSaleCountMap[msg.sender] += _mintCount;

        emit Mint(
            msg.sender,
            _tokenId,
            mintPrice,
            block.timestamp
        );

        return _tokenId;
    }

    function withdraw() external {
        require(address(this).balance != 0, "withdrawFunds: must have funds to withdraw");
        uint256 balance = address(this).balance;
        payable(treasuryWallet).transfer(balance);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        return tokenURIMap[tokenId];
    }

    function setTokenURI(uint8 tokenId, string memory _tokenURI) external onlyOwner returns (string memory) {
        tokenURIMap[tokenId] = _tokenURI;
        return _tokenURI;
    }

    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    function changePresaleMintPrice(uint _price) external onlyOwner {
        presalePrice = _price;
    }

    function changePublicMintPrice(uint _price) external onlyOwner {
        mintPrice = _price;
    }

    function setPresaleTimeStamp(uint _presaleTimeStamp) external onlyOwner {
        presaleStartTime = _presaleTimeStamp;
    }

    function setPublicSaleTimeStamp(uint _publicSaleTimeStamp) external onlyOwner {
        publicSaleStartTime = _publicSaleTimeStamp;
    }

    function setPresaleMintLimit(uint16 _presaleMintLimit) external onlyOwner {
        presaleMintLimit = _presaleMintLimit;
    }

    function setTreasuryWallet(address _wallet) external onlyOwner{
        treasuryWallet = _wallet;
    }
}
