import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Cinema", (m) => {
  const cinemaMarket = m.contract("CinemaMarket", []);
  //const cinemaInfo = m.contract("CinemaInfo", []);

  return { cinemaMarket };
});