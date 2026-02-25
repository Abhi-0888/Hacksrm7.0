const { quais } = require("quais");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    // 1. Setup Provider and Signer for Cyprus-1
    const provider = new quais.JsonRpcProvider("https://rpc.quai.network/v1/cyprus1");

    if (!process.env.PRIVATE_KEY) {
        console.error("Please provide PRIVATE_KEY in .env file");
        process.exit(1);
    }

    const wallet = new quais.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Deploying contracts on Quai Cyprus-1 with account:", wallet.address);

    const CollegeDAOArtifact = require("../artifacts/contracts/CollegeDAO.sol/CollegeDAO.json");
    const GovernanceTokenArtifact = require("../artifacts/contracts/GovernanceToken.sol/GovernanceToken.json");

    // 2. Deploy Governance Token
    console.log("Deploying GovernanceToken...");
    const deployTokenTx = {
        data: GovernanceTokenArtifact.bytecode,
        ipfsHash: "QmeGAVddnBSnKc1DLE7DLV9uuTzf5xrRBirSCPapnPtMZd" // Valid IPFS hash
    };
    const tokenTx = await wallet.sendTransaction(deployTokenTx);
    await tokenTx.wait();
    const tokenAddress = (await provider.getTransactionReceipt(tokenTx.hash)).contractAddress;
    console.log("GovernanceToken deployed to:", tokenAddress);

    // 3. Deploy CollegeDAO
    console.log("Deploying CollegeDAO...");
    const CollegeDAO = new quais.ContractFactory(CollegeDAOArtifact.abi, CollegeDAOArtifact.bytecode, wallet);
    // Use factory to get deploy data, then send manually
    const deployDaoTxReq = await CollegeDAO.getDeployTransaction(tokenAddress);
    const deployDaoTx = {
        ...deployDaoTxReq,
        ipfsHash: "QmeGAVddnBSnKc1DLE7DLV9uuTzf5xrRBirSCPapnPtMZd"
    };
    const daoTx = await wallet.sendTransaction(deployDaoTx);
    await daoTx.wait();
    const daoAddress = (await provider.getTransactionReceipt(daoTx.hash)).contractAddress;
    console.log("CollegeDAO deployed to:", daoAddress);

    // 4. Config
    const fee = quais.parseQuai("0.01");
    // Manual call for config
    const daoContract = new quais.Contract(daoAddress, CollegeDAOArtifact.abi, wallet);
    const configData = daoContract.interface.encodeFunctionData("setConfig", [0, fee, true]);
    const configTxReq = {
        to: daoAddress,
        data: configData,
        ipfsHash: "QmeGAVddnBSnKc1DLE7DLV9uuTzf5xrRBirSCPapnPtMZd"
    };
    const configTx = await wallet.sendTransaction(configTxReq);
    await configTx.wait();
    console.log("DAO config updated: minTokensToPropose = 0");

    // 5. Save Addresses
    const addresses = {
        GovernanceToken: tokenAddress,
        CollegeDAO: daoAddress
    };

    const frontendDir = path.join(__dirname, "../../frontend/src/abi");
    fs.writeFileSync(
        path.join(frontendDir, "contract-address.json"),
        JSON.stringify(addresses, null, 2)
    );
    console.log("Addresses saved to frontend!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
