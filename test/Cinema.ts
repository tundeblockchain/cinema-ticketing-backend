import { expect } from "chai";
import { network } from "hardhat";

describe("Cinema", function () {
  async function deployCinemaFixture() {
    const { ethers, networkHelpers } = await network.create();
    const [owner, otherAccount] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("USDC");
    const erc20 = await ERC20.deploy("USDC", "USDC", 1000000000);

    const CinemaMarket = await ethers.getContractFactory("CinemaMarket");
    const ercAddress = await erc20.getAddress();
    const cinemaMarket = await CinemaMarket.deploy();
    await cinemaMarket.setUSDCAddress(ercAddress);
    const cinemaMarketAddress = await cinemaMarket.getAddress();

    const CinemaInfo = await ethers.getContractFactory("CinemaInfo");
    const cinemaInfo = await CinemaInfo.deploy();
    await cinemaInfo.setMarket(cinemaMarketAddress);

    return { erc20, cinemaMarket, owner, otherAccount, cinemaInfo, ethers, networkHelpers };
  }

  async function deployCinemaFixtureWithCinemaInfo() {
    const { ethers, networkHelpers } = await network.create();
    const [owner, otherAccount] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("USDC");
    const erc20 = await ERC20.deploy("USDC", "USDC", 100000000);

    const CinemaMarket = await ethers.getContractFactory("CinemaMarket");
    const ercAddress = await erc20.getAddress();
    const cinemaMarket = await CinemaMarket.deploy();
    await cinemaMarket.setUSDCAddress(ercAddress);
    const cinemaMarketAddress = await cinemaMarket.getAddress();

    const CinemaInfo = await ethers.getContractFactory("CinemaInfo");
    const cinemaInfo = await CinemaInfo.deploy();
    await cinemaInfo.setMarket(cinemaMarketAddress);

    await cinemaInfo.addCinema("cinemaId", "Odeon", "cinema.com");
    await cinemaInfo.addPlace("placeId", "cinemaId", "place.com");
    await cinemaInfo.addScreen("Screen1", "placeId", "screen.com");
    await cinemaInfo.addScreen("Screen2", "placeId", "screen2.com");

    await cinemaInfo.addFilm("filmId", "Dune", "dune.com");
    await cinemaInfo.addActor("actorId", "Me");

    return { erc20, cinemaMarket, owner, otherAccount, cinemaInfo, ethers, networkHelpers };
  }

  describe("Create Cinema NFT", function () {
    it("Should create a cinema chain", async function () {
      const { cinemaMarket } = await deployCinemaFixture();

      await cinemaMarket.createCinemaChain("Odeon");
      const cinemaChains = await cinemaMarket.fetchCinemaChains();
      expect(cinemaChains.length).to.equal(1);
    });

    it("Should create ticket on a cinema chain", async function () {
      const { erc20, cinemaMarket } = await deployCinemaFixture();

      await cinemaMarket.createCinemaChain("Odeon");
      const cinemaChains = await cinemaMarket.fetchCinemaChains();
      const price = 10;
      const cinemaMarketAddress = cinemaMarket.getAddress();
      await erc20.approve(cinemaMarketAddress, price * 10 ** 6);
      await cinemaMarket.createTicket(
        cinemaChains[0].nftContract,
        "Dune",
        "www.google.com",
        price,
        "ScreenId"
      );
      const result = await cinemaMarket.getNumberOfTickets();
      expect(result).to.equal(1);
    });

    it("Should fetch tickets by Owner successfully", async function () {
      const { erc20, cinemaMarket, owner } = await deployCinemaFixture();

      await cinemaMarket.createCinemaChain("Odeon");
      const cinemaChains = await cinemaMarket.fetchCinemaChains();
      const price = 10;
      const cinemaMarketAddress = cinemaMarket.getAddress();
      await erc20.approve(cinemaMarketAddress, price * 10 ** 6);
      await cinemaMarket.createTicket(
        cinemaChains[0].nftContract,
        "Dune",
        "www.google.com",
        price,
        "ScreenId"
      );
      const result = await cinemaMarket.fetchTicketsForOwner(owner.address);
      expect(result.length).to.equal(1);
    });

    it("Should add ticket on market", async function () {
      const { erc20, cinemaMarket, ethers } = await deployCinemaFixture();

      await cinemaMarket.createCinemaChain("Odeon");
      const cinemaChains = await cinemaMarket.fetchCinemaChains();
      const price = 10;
      const cinemaMarketAddress = cinemaMarket.getAddress();
      await erc20.approve(cinemaMarketAddress, price * 10 ** 6);
      await cinemaMarket.createTicket(
        cinemaChains[0].nftContract,
        "Dune",
        "www.google.com",
        price,
        "ScreenId"
      );
      const tickets = await cinemaMarket.fetchTicketsByScreenId("ScreenId");
      const CinemaTicket = await ethers.getContractFactory("CinemaTicket");
      const cinemaTicket = CinemaTicket.attach(tickets[0].nftContract);
      await cinemaTicket.approve(cinemaMarketAddress, tickets[0].itemID);
      await cinemaMarket.createMarketItem(
        tickets[0].nftContract,
        tickets[0].itemID,
        10
      );
      const marketItems = await cinemaMarket.fetchMarketItems();
      expect(marketItems.length).to.equal(1);
    });

    it("Should sell ticket on market", async function () {
      const { erc20, cinemaMarket, otherAccount, ethers } =
        await deployCinemaFixture();

      await cinemaMarket.createCinemaChain("Odeon");
      const cinemaChains = await cinemaMarket.fetchCinemaChains();
      const price = 10;
      const cinemaMarketAddress = cinemaMarket.getAddress();
      await erc20.approve(cinemaMarketAddress, price * 10 ** 6);
      await cinemaMarket.createTicket(
        cinemaChains[0].nftContract,
        "Dune",
        "www.google.com",
        price,
        "ScreenId"
      );
      const tickets = await cinemaMarket.fetchTicketsByScreenId("ScreenId");
      const CinemaTicket = await ethers.getContractFactory("CinemaTicket");
      const cinemaTicket = CinemaTicket.attach(tickets[0].nftContract);
      await cinemaTicket.approve(cinemaMarketAddress, tickets[0].itemID);
      await cinemaMarket.createMarketItem(
        tickets[0].nftContract,
        tickets[0].itemID,
        10
      );

      const otherAccountAddress = await otherAccount.getAddress();
      console.log(otherAccountAddress);
      await erc20.transfer(otherAccountAddress, 500);

      await erc20.connect(otherAccount).approve(cinemaMarketAddress, price * 5 * 10 ** 6);
      await cinemaMarket
        .connect(otherAccount)
        .createMarketSale(tickets[0].nftContract, tickets[0].itemID);

      const marketItems = await cinemaMarket.fetchMarketItems();
      expect(marketItems.length).to.equal(0);
    });
  });

  describe("Create Cinema Info", function () {
    it("Should add a cinema successfully", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addCinema("cinemaId", "Odeon", "www.google.com");
      const cinemaChains = await cinemaInfo.totalNumberOfCinemas();
      expect(cinemaChains).to.equal(1);
    });

    it("Should add a place successfully", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addCinema("cinemaId", "Odeon", "www.google.com");
      await cinemaInfo.addPlace("placeId", "cinemaId", "www.google.com");
      const places = await cinemaInfo.totalNumberOfPlaces();
      expect(places).to.equal(1);
    });

    it("Should add a place and revert", async function () {
      const { cinemaInfo } = await deployCinemaFixture();
      await expect(
        cinemaInfo.addPlace("placeId", "cinemaId", "www.google.com")
      ).to.be.revertedWith("Place should be connected to existing cinema");
    });

    it("Should add a screen successfully", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addCinema("cinemaId", "Odeon", "cinema.com");
      await cinemaInfo.addPlace("placeId", "cinemaId", "place.com");
      await cinemaInfo.addScreen("screenId", "placeId", "screen.com");
      await cinemaInfo.addScreen("screenId2", "placeId", "screen.com");
      const screens = await cinemaInfo.totalNumberOfScreens();
      expect(screens).to.equal(2);
    });

    it("Should add a screen and revert", async function () {
      const { cinemaInfo } = await deployCinemaFixture();
      await expect(
        cinemaInfo.addScreen("screenId", "placeId", "screen.com")
      ).to.be.revertedWith("Screen should be connected to existing place");
    });

    it("Should add a film successfully", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addFilm("filmId", "Dune", "dune.com");
      const films = await cinemaInfo.totalNumberOfFilms();
      expect(films).to.equal(1);
    });

    it("Should add an actor successfully", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addActor("actorId", "Me");
      const actors = await cinemaInfo.totalNumberOfActors();
      expect(actors).to.equal(1);
    });
  });

  describe("Retrieve Cinema Info", function () {
    it("Should retrieve all cinema chains", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addCinema("cinemaId", "Odeon", "test.com");
      await cinemaInfo.addCinema("cinemaId2", "Odeon2", "test2.com");
      const cinemaChains = await cinemaInfo.getAllCinemas();
      expect(cinemaChains.length).to.equal(2);
      expect(cinemaChains[0][0]).to.equal("cinemaId");
      expect(cinemaChains[1][0]).to.equal("cinemaId2");
    });

    it("Should retrieve all places", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addCinema("cinemaId", "Odeon", "cinema.com");
      await cinemaInfo.addPlace("placeId", "cinemaId", "test.com");
      await cinemaInfo.addPlace("placeId2", "cinemaId", "test2.com");
      const places = await cinemaInfo.getAllPlaces();
      expect(places.length).to.equal(2);
      expect(places[0][0]).to.equal("placeId");
      expect(places[1][0]).to.equal("placeId2");
    });

    it("Should retrieve all screens", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addCinema("cinemaId", "Odeon", "cinema.com");
      await cinemaInfo.addPlace("placeId", "cinemaId", "place.com");
      await cinemaInfo.addScreen("Screen1", "placeId", "screen.com");
      await cinemaInfo.addScreen("Screen2", "placeId", "screen2.com");
      const screens = await cinemaInfo.getAllScreens();
      expect(screens.length).to.equal(2);
      expect(screens[0][0]).to.equal("Screen1");
      expect(screens[1][0]).to.equal("Screen2");
    });

    it("Should retrieve all films", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addFilm("filmId", "Dune", "dune.com");
      await cinemaInfo.addFilm("filmId2", "The Dark Knight", "tdk.com");
      const films = await cinemaInfo.getAllFilms();
      expect(films.length).to.equal(2);
      expect(films[0][0]).to.equal("filmId");
      expect(films[1][0]).to.equal("filmId2");
    });

    it("Should retrieve all actors", async function () {
      const { cinemaInfo } = await deployCinemaFixture();

      await cinemaInfo.addActor("actorId", "Me");
      await cinemaInfo.addActor("actorId2", "Me2");
      const actors = await cinemaInfo.getAllActors();
      expect(actors.length).to.equal(2);
      expect(actors[0][0]).to.equal("actorId");
      expect(actors[1][0]).to.equal("actorId2");
    });

    it("Should successfully retrieve cinema by Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      const cinemaChain = await cinemaInfo.getCinema("cinemaId");
      expect(cinemaChain.itemID).to.equal("cinemaId");
    });

    it("Should revert when retrieve cinema by incorrect Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      await expect(cinemaInfo.getCinema("test")).to.be.revertedWith(
        "Cinema does not exist"
      );
    });

    it("Should successfuly retrieve place by Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      const place = await cinemaInfo.getPlace("placeId");
      expect(place.itemID).to.equal("placeId");
    });

    it("Should revert when retrieve place by incorrect Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      await expect(cinemaInfo.getPlace("test")).to.be.revertedWith(
        "Place does not exist"
      );
    });

    it("Should successfuly retrieve screen by Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      const screen = await cinemaInfo.getScreen("Screen1");
      expect(screen.itemID).to.equal("Screen1");
    });

    it("Should revert when retrieve screen by incorrect Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      await expect(cinemaInfo.getScreen("test")).to.be.revertedWith(
        "Screen does not exist"
      );
    });

    it("Should successfuly retrieve film by Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      const film = await cinemaInfo.getFilm("filmId");
      expect(film.itemID).to.equal("filmId");
    });

    it("Should revert when retrieve film by incorrect Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      await expect(cinemaInfo.getFilm("test")).to.be.revertedWith(
        "Film does not exist"
      );
    });

    it("Should successfuly retrieve actor by Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      const actor = await cinemaInfo.getActor("actorId");
      expect(actor.itemID).to.equal("actorId");
    });

    it("Should revert when retrieve actor by incorrect Id", async function () {
      const { cinemaInfo } = await deployCinemaFixtureWithCinemaInfo();

      await expect(cinemaInfo.getActor("test")).to.be.revertedWith(
        "Actor does not exist"
      );
    });
  });
});
