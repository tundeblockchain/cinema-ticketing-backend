# cinema-ticketing-backend
 Blockchain contracts for Cinema Ticketing system

 This is a proof of concept and it is NOT production ready.
 This is a hardhat solidity project used to test and deploy the contracts

 There are 3 main contracts (CinemaInfo.sol, CinemaMarket.sol, CinemaTicket.sol)
 - CinemaTicket.sol is the NFT contract, each ticket is represented as an nft. It follows the ERC721URI storage standard so that the most of the ticket data is stored on a uri pointing to IPFS where the data is held.
 - CinemaInfo.sol is the creation and retrieval of the cimema data such as Cinema chains, locations, screens, films and actors.
 - CinemaMarket.sol is where the transactions of the tickets take place. This handles minting tickets, buying and selling tickets, even creating a secondary ticket marketplace where users can resell there tickets.

There will be .env files which needs to created, this will hold 2 variables "PRIVATE_KEY" and "PROVIDER_WSS". The private key will hold the key used to deploy to the mainnet or test net and provider_wss is the websocket url for the RPC.
