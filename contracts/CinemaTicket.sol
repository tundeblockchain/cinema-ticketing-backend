// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../interfaces/ICinemaMarket.sol";

contract CinemaTicket is ERC721URIStorage{
    uint256 private _tokenIDs;
    ICinemaMarket private nftMarket;
    address private owner;
    address private marketAddress;
    string private nftName;

    modifier onlyOwner(){
        require(msg.sender == owner, "untrusted message sender");
        _;
    }

    constructor(string memory _name, address _ownerContract, address _marketAddress) ERC721(_name, _name){
        owner = _ownerContract;
        marketAddress = _marketAddress;
        nftName = _name;
    }

    // Create multiple tickets for a user
    function createMultipleTickets(string[] memory metaDataURIs, address tokenOwner) public {
        for (uint i = 0; i < metaDataURIs.length; i++){
            createToken(metaDataURIs[i], tokenOwner);
        }
    }

    // Create Ticket
    function createToken(string memory tokenURI, address tokenOwner) public returns (uint256 newItemId){
        newItemId = _tokenIDs;
        _mint(tokenOwner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        // setApprovalForAll(contractAddress, true);
        setApprovalForAll(msg.sender, true);
        //approve(tokenOwner, newItemId);
        // nftMarket = ICinemaMarket(marketAddress);
        // nftMarket.createMarketItemFromNFT(address(this), newItemId, 0, msg.sender);
        _tokenIDs++;
    }

    // Returns total songs in album
    function getTotalTickets() public view returns (uint256 totalTokens){
        return _tokenIDs;
    }

    function updateTicketInfo(uint256 ticketId, string memory tokenURI) public onlyOwner{
        _setTokenURI(ticketId, tokenURI);
    }

    function getName() public view returns (string memory){
        return nftName;
    }
}