import { ethers, Wallet } from "ethers";
import { sendJsonRpc } from "./base";
import BattleShipGameJson from "./BattleShipGame.json";
import { Coordinate, signShipCoordinates } from "./utils";

export const provider = new ethers.providers.JsonRpcProvider(
  "https://zero.alt.technology"
);

export const gameContractWithProvider = (gameAddress: string) =>
  new ethers.Contract(gameAddress, BattleShipGameJson.abi, provider);

export const deployGame = async (enemyAddress: string, userAddress: string) => {
  const CONTRACT_ABI = BattleShipGameJson.abi; // Your contract's ABI
  const CONTRACT_BYTECODE = BattleShipGameJson.bytecode; // Your contract's bytecode
  const wallet = new Wallet(userAddress, provider);
  const signer = wallet.connect(provider);
  console.log("[wallet.address, enemyAddress]", [wallet.address, enemyAddress]);

  const contractFactory = new ethers.ContractFactory(
    CONTRACT_ABI,
    CONTRACT_BYTECODE,
    signer
  );
  const contract = await contractFactory.deploy(
    [wallet.address, enemyAddress],
    { gasPrice: 0 }
  );

  console.log("Contract deployment tx:", contract.deployTransaction.hash);
  await contract.deployed(); // Wait for the transaction to be mined
  console.log("Contract deployed at:", contract.address);

  return contract.address;
};

export const joinGame = async (
  gameAddress: string,
  playerDeployedShips: { occupiedBlocks: string[] }[],
  signer: Wallet
) => {
  //save playerDeployedShips to localsotrage
  localStorage.setItem(
    "playerDeployedShips",
    JSON.stringify(playerDeployedShips)
  );
  localStorage.setItem("gameAddress", gameAddress);

  console.log(`GameAddress: ${gameAddress}`);

  const shipCoordinates: Coordinate[][] = playerDeployedShips.map((ship) => {
    return ship.occupiedBlocks.map((block) => {
      const x = block[0];
      const y = block[1];
      return { x: parseInt(x), y: parseInt(y) };
    });
  });

  const signedShips = await signShipCoordinates(shipCoordinates, signer);

  const battleshipContract = new ethers.Contract(
    gameAddress,
    BattleShipGameJson.abi,
    signer
  );

  // battleshipContract.on("GameStarted", (args) => {
  //   console.log("GameStarted", args);
  // });

  const encodedData = battleshipContract.interface.encodeFunctionData(
    "joinGame",
    [signedShips.flat()]
  );
  const currentNonce = await provider.getTransactionCount(
    signer.address,
    "latest"
  );
  console.log(`Current nonce: ${currentNonce}`);
  console.log(`Singer address: ${battleshipContract.signer.getAddress()}`);
  const transaction = {
    to: battleshipContract.address,
    data: encodedData,
    nonce: currentNonce,
    gasPrice: 0,
    gasLimit: 2100000,
  };
  const signedTransaction = await battleshipContract.signer.signTransaction(
    transaction
  );
  const encodedTransactionData = ethers.utils.hexlify(signedTransaction);
  const res = await sendJsonRpc("https://zero.alt.technology", {
    method: "eth_sendRawTransaction",
    params: [encodedTransactionData],
  });

  console.log("res", res);
};
