// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ICinemaTicket {
    function createMultipleTickets(string[] memory metaDataURIs, address tokenOwner) external;
    function createToken(string memory tokenURI, address tokenOwner) external returns (uint256 newItemId);
    function getTotalTickets() external view returns (uint256 totalTokens);
    function updateTicketInfo(uint256 _ticketId, string memory tokenURI) external;
    function getName() external view returns (string memory cinemaName);
    function setApprovalForAll(address operator, bool approved) external;
    function ownerOf(uint256 tokenId) external view returns (address owner);
}