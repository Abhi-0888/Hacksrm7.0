const hre = require("hardhat");

async function main() {
  console.log("Starting deployment script...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying EventDAO with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "QUAI");

  const EventDAO = await hre.ethers.getContractFactory("EventDAO");
  const eventDAO = await EventDAO.deploy();
  await eventDAO.waitForDeployment();

  const deployedAddress = await eventDAO.getAddress();
  console.log("──────────────────────────────────────────────");
  console.log("EventDAO deployed to:", deployedAddress);
  console.log("Network:", hre.network.name);
  console.log("──────────────────────────────────────────────");
  console.log("\nSave this address in your frontend .env file:");
  console.log(`VITE_EVENT_DAO_ADDRESS=${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
