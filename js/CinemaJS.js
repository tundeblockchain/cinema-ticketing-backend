const ethers = require('ethers')
const CinemaInfoABI = require('../artifacts/contracts/CinemaInfo.sol/CinemaInfo.json');
const CinemaMarketABI = require('../artifacts/contracts/CinemaMarket.sol/CinemaMarket.json');
const { vars } = require("hardhat/config");
vars.get("KEY")

let cinemaInfoAddress = '0x5D7bdCb82fb9d19b32d477e5C1C7aF7826767d31';
let cinemaMarketAddress = '0x340Be644B76E3Ba10FC2450BD97CD6623FB17773';

const run = async () => {
    console.log(vars.get("PROVIDER_WSS"))
    const provider = new ethers.WebSocketProvider(vars.get("PROVIDER_WSS"));
    const wallet = new ethers.Wallet(vars.get("PRIVATEKEY"), provider);
    const cinemaInfoContract = new ethers.Contract(cinemaInfoAddress, CinemaInfoABI.abi, provider);
    const cinemaMarketContract = new ethers.Contract(cinemaMarketAddress, CinemaMarketABI.abi, provider);

    // Create Initial Cinema Chain
    let createChainTx = await cinemaInfoAddress.createCinemaChain("Odeon");
    let createChainReceipt = await createChainTx.wait();
    let cinemaInfoChainTx = await cinemaInfoContract.addCinema("0e84bd01-6261-4113-8661-82cdcef1fe7b", "Odeon", "https://ipfs.io/ipfs/QmRTjgrqKf5hPxW8wTpU6naSL27kzuyFHgzfY79ETrcnNi?filename=Odeon.json");
    await cinemaInfoChainTx.wait();

    // Add Film
    let addFilmTx  = await cinemaInfoContract.addFilm("e8892bcb-cc83-493d-964a-ce48b8e2d157", "Dune", "https://ipfs.io/ipfs/QmWJXFnqgz1byah9GGriLPC6ck8WnHAL1znT9SRWyKBoJt?filename=Dune.json");
    let addFilmReceipt = await addFilmTx.wait();

    // Add Actors
    let actor1Tx = await cinemaInfoContract.addActor("8e73891b-57f1-4b3b-b970-7ca73bed3b71", "https://ipfs.io/ipfs/QmNdK4xNAbNnJHTU6DfU49qvggVfGqBR5nimJLoRzmNdVv?filename=Timoth%C3%A9e%20Chalamet.json");
    let actor1Receipt = await actor1Tx.wait();

    let actor2Tx = await cinemaInfoContract.addActor("e60d11f4-973b-489a-9939-6d792b218575", "https://ipfs.io/ipfs/QmRd6LrbXezQEh5ZL6KPEG3RoW5FB1PqKknyUEB9mFagrZ?filename=Zendaya.json");
    let actor2Receipt = await actor2Tx.wait();

    let actor3Tx = await cinemaInfoContract.addActor("eed08276-506e-4ab1-9edf-846b52abd788", "https://ipfs.io/ipfs/QmbqXBpZoFnvRNED4Ai9WiKiJb1ATBbWEv3pARnhc55BjQ?filename=Rebecca%20Ferguson.json");
    let actor3Receipt = await actor3Tx.wait();

    let films = await cinemaInfoContract.totalNumberOfFilms();
    let actors = await cinemaInfoContract.totalNumberOfActors();

    console.log('Number Of Films:', films.length);
    console.log('Number Of Actors:', actors.length);
};

run();