/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  paths: {
    sources: "./onboarder/solidity-contracts",
    tests: "./onboarder/solidity-contracts/test",
    cache: "./cache",
    artifacts: "./onboarder/solidity-contracts/artifacts"
  }
};
