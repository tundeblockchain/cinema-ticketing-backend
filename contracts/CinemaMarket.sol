// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CinemaTicket.sol";
import "../interfaces/ICinemaTicket.sol";

contract CinemaMarket is ReentrancyGuard{
    uint256 private _itemIDs;
    uint256 private _itemsSold;
    uint256 private _ticketIDs;
    uint256 private _cinemaIDs;
    address payable public owner;
    uint256 constant listingPrice = 2;
    address private _erc20Address;
    uint256 constant private decimals = 6;
    struct MarketItem {
        uint256 itemID;
        address nftContract;
        uint256 tokenID;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    struct TicketItem {
        uint256 itemID;
        string title;
        address nftContract;
        address payable owner;
        uint256 price;
        string screenId;
        string uri;
    }

    struct CinemaItem {
        uint256 itemID;
        string name;
        address nftContract;
        address payable owner;
    }

    mapping(uint256 => MarketItem) private _marketItems;
    mapping(uint256 => TicketItem) private _ticketItems;
    mapping(uint256 => CinemaItem) private _cinemaItems;

    event CinemaCreated (
        uint indexed itemID,
        string name,
        address indexed nftContract,
        address owner
    );

    event TicketCreated (
        uint indexed itemID,
        string title,
        address indexed nftContract,
        address owner,
        uint256 price,
        string ticketURI
    );

    event MarketItemCreated (
        uint indexed itemID,
        address indexed nftContract,
        uint256 indexed tokenID,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold (
        uint indexed itemID,
        address indexed nftContract,
        uint256 indexed tokenID,
        address newOwner,
        uint256 price
    );

    modifier onlyOwner(){
        require(msg.sender == owner, "untrusted message sender");
        _;
    }

    constructor(){
        owner = payable(msg.sender);
    }

    function setUSDCAddress(address usdcAddress) public onlyOwner{
        _erc20Address = usdcAddress;
    }

    // Creates NFT cinema ticket
    function createCinemaChain(string memory tokenName) public returns (address){
        CinemaTicket newCinema = new CinemaTicket(tokenName, msg.sender, address(this));
        address newCinemaAddress = address(newCinema);
        uint256 cinemaID = _cinemaIDs;
        _cinemaItems[_cinemaIDs] = CinemaItem(cinemaID, tokenName, newCinemaAddress, payable(msg.sender));
        emit CinemaCreated(cinemaID, tokenName, newCinemaAddress, payable(msg.sender));
        _cinemaIDs++;
        return newCinemaAddress;
    }

    function createTicket(address cinemaAddress, string memory filmName, string memory ticketURI, uint256 price, string memory screenId) public nonReentrant{
        ICinemaTicket cinema = ICinemaTicket(cinemaAddress);
        uint256 ticketID = cinema.createToken(ticketURI, msg.sender);

        // Create nft ticket for user
        _ticketItems[ticketID] = TicketItem(ticketID, filmName, address(cinema), payable(msg.sender), price, screenId, ticketURI);
        
        bool x = IERC20(_erc20Address).transferFrom(msg.sender, address(this), price * (10 ** decimals));

        // transfer money
        emit TicketCreated(ticketID, filmName, cinemaAddress, payable(msg.sender), price, ticketURI);
        _ticketIDs++;
    }

    // Lists a new item on the NFT Marketplace
    function createMarketItem(address nftContract, uint256 tokenID, uint256 price) public nonReentrant{
        uint256 itemID = _itemIDs;
        _marketItems[itemID] = MarketItem(itemID, nftContract, tokenID, payable(msg.sender), payable(address(0)), price, false);
        _itemIDs++;
        IERC721(nftContract).setApprovalForAll(address(this), true);
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenID);
        emit MarketItemCreated(itemID, nftContract, tokenID, payable(msg.sender), payable(address(0)), price, false);
        
    }

    function createMarketItemFromNFT(address nftContract, uint256 tokenID, uint256 price, address minter) public nonReentrant{
        uint256 itemID = _itemIDs;

        _marketItems[itemID] = MarketItem(itemID, nftContract, tokenID, payable(minter), payable(address(0)), price, false);
        _itemIDs++;
        IERC721(nftContract).transferFrom(minter, address(this), tokenID);
        emit MarketItemCreated(itemID, nftContract, tokenID, payable(minter), payable(address(0)), price, false); 
    }

    // Allows an account to purchase an NFT from the marketplace
    function createMarketSale(address nftContract, uint256 itemID) public nonReentrant{
        uint price = _marketItems[itemID].price;
        uint tokenID = _marketItems[itemID].tokenID;

        _marketItems[itemID].owner = payable(msg.sender);
        _marketItems[itemID].sold = true;

        bool isApproved = IERC20(_erc20Address).approve(address(this), price);
        bool x = IERC20(_erc20Address).transferFrom(msg.sender, _marketItems[itemID].seller, price);

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenID);
        
        // Take fee
        bool y = IERC20(_erc20Address).transferFrom(_marketItems[itemID].owner, address(this), listingPrice);
        emit MarketItemSold(itemID, nftContract, tokenID, payable(msg.sender), price);
        _itemsSold++;
    }

    // Returns all NFT collections as albums
    function fetchTicketsByScreenId(string memory screenId) public view returns (TicketItem[] memory){
        TicketItem[] memory ret = new TicketItem[](_ticketIDs);
        for (uint i = 0; i < _ticketIDs; i++) {
            if (keccak256(abi.encodePacked(screenId)) == keccak256(abi.encodePacked(_ticketItems[i].screenId)))
                ret[i] = _ticketItems[i];
        }

        return ret;
    }

    function fetchTicketsForOwner(address ticketOwner) public view returns (TicketItem[] memory){
        TicketItem[] memory ret = new TicketItem[](_ticketIDs);
        for (uint i = 0; i < _ticketIDs; i++) {
            if (_ticketItems[i].owner == ticketOwner)
                ret[i] = _ticketItems[i];
        }

        return ret;
    }

    // Returns all NFTs on marketplace
    function fetchMarketItems() public view returns (MarketItem[] memory){
        uint totalItems = _itemIDs;
        uint unsold = totalItems - _itemsSold;
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsold);
        for (uint i = 0; i < totalItems; i++){
            if (_marketItems[i].owner == address(0)){
                uint currentItemID = _marketItems[i].itemID;
                MarketItem storage currentItem = _marketItems[currentItemID];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    function fetchCinemaChains() public view returns (CinemaItem[] memory){
        CinemaItem[] memory ret = new CinemaItem[](_cinemaIDs);
        for (uint i = 0; i < _cinemaIDs; i++) {
            ret[i] = _cinemaItems[i];
        }

        return ret;
    }

    function getNumberOfTickets() public view returns (uint256){
        return _ticketIDs;
    }
}