// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ICinemaMarket {
   function createMarketItemFromNFT(address nftContract, uint256 tokenID, uint256 price, address minter) external payable;
   function createCinemaChain(string memory tokenName) external returns (address);
   function createTicket(address cinemaAddress, string memory filmName, string memory ticketURI, uint256 price) external payable;
   function createMarketItem(address nftContract, uint256 tokenID, uint256 price) external payable;
   function createMarketSale(address nftContract, uint256 itemID) external payable;
}