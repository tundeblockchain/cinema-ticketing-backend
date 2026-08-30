import { ethers } from "ethers";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const CinemaInfoABI = require("../artifacts/contracts/CinemaInfo.sol/CinemaInfo.json");
const CinemaMarketABI = require("../artifacts/contracts/CinemaMarket.sol/CinemaMarket.json");

const cinemaInfoAddress = "0x5D7bdCb82fb9d19b32d477e5C1C7aF7826767d31";
const cinemaMarketAddress = "0x340Be644B76E3Ba10FC2450BD97CD6623FB17773";

const run = async () => {
  const providerWss = process.env.PROVIDER_WSS;
  const privateKey = process.env.PRIVATE_KEY;

  if (!providerWss || !privateKey) {
    console.error("Missing PROVIDER_WSS or PRIVATE_KEY environment variables");
    process.exit(1);
  }

  console.log(providerWss);
  const provider = new ethers.WebSocketProvider(providerWss);
  const wallet = new ethers.Wallet(privateKey, provider);
  const cinemaInfoContract = new ethers.Contract(
    cinemaInfoAddress,
    CinemaInfoABI.abi,
    wallet
  );
  const cinemaMarketContract = new ethers.Contract(
    cinemaMarketAddress,
    CinemaMarketABI.abi,
    wallet
  );

  // Create Initial Cinema Chain
  const createChainTx = await cinemaMarketContract.createCinemaChain("Odeon");
  await createChainTx.wait();
  const cinemaInfoChainTx = await cinemaInfoContract.addCinema(
    "0e84bd01-6261-4113-8661-82cdcef1fe7b",
    "Odeon",
    "https://ipfs.io/ipfs/QmRTjgrqKf5hPxW8wTpU6naSL27kzuyFHgzfY79ETrcnNi?filename=Odeon.json"
  );
  await cinemaInfoChainTx.wait();

  // Add Film
  const addFilmTx = await cinemaInfoContract.addFilm(
    "e8892bcb-cc83-493d-964a-ce48b8e2d157",
    "Dune",
    "https://ipfs.io/ipfs/QmWJXFnqgz1byah9GGriLPC6ck8WnHAL1znT9SRWyKBoJt?filename=Dune.json"
  );
  await addFilmTx.wait();

  // Add Actors
  const actor1Tx = await cinemaInfoContract.addActor(
    "8e73891b-57f1-4b3b-b970-7ca73bed3b71",
    "https://ipfs.io/ipfs/QmNdK4xNAbNnJHTU6DfU49qvggVfGqBR5nimJLoRzmNdVv?filename=Timoth%C3%A9e%20Chalamet.json"
  );
  await actor1Tx.wait();

  const actor2Tx = await cinemaInfoContract.addActor(
    "e60d11f4-973b-489a-9939-6d792b218575",
    "https://ipfs.io/ipfs/QmRd6LrbXezQEh5ZL6KPEG3RoW5FB1PqKknyUEB9mFagrZ?filename=Zendaya.json"
  );
  await actor2Tx.wait();

  const actor3Tx = await cinemaInfoContract.addActor(
    "eed08276-506e-4ab1-9edf-846b52abd788",
    "https://ipfs.io/ipfs/QmbqXBpZoFnvRNED4Ai9WiKiJb1ATBbWEv3pARnhc55BjQ?filename=Rebecca%20Ferguson.json"
  );
  await actor3Tx.wait();
  const films = await cinemaInfoContract.totalNumberOfFilms();
  const actors = await cinemaInfoContract.totalNumberOfActors();

  console.log("Number Of Films:", films);
  console.log("Number Of Actors:", actors);
};

run();
