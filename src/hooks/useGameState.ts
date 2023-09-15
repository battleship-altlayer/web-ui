import { gameContractWithProvider } from "@/utils/game";
import { Coordinate } from "@/utils/utils";
import { Wallet } from "ethers";
import { useEffect, useState } from "react";

const getPlayers = async (gameAddress: string) => {
  const battleshipContract = gameContractWithProvider(gameAddress);
  const player1: string = await battleshipContract.playersAddress(0);
  const player2: string = await battleshipContract.playersAddress(1);
  const contractOwner: string = await battleshipContract.owner();
  return [player1, player2, contractOwner] as string[];
};

const getUserHitCoordinates = async (
  gameAddress: string,
  userAddress: string
) => {
  const battleshipContract = gameContractWithProvider(gameAddress);

  const missles: Coordinate[] = await battleshipContract.getPlayerHistory(
    userAddress
  );

  console.log("missles", missles);

  return missles;
};

export const useGameState = (gameAddress: string, user: Wallet | null) => {
  const [loading, setLoading] = useState(false);
  const [enemy, setEnemy] = useState<string>();
  const [contractOwner, setContractOwner] = useState<string>();
  const [missleCoordinatesByUser, setMissleCoordinatesByUser] = useState<
    Map<string, Coordinate[]>
  >(new Map<string, Coordinate[]>([]));

  const fetchGameState = async (gameAddress: string, playerAddress: string) => {
    setLoading(true);
    const _players = await getPlayers(gameAddress);
    _players.slice(0, 2).forEach((pl) => {
      if (pl != playerAddress) setEnemy(pl);
    });
    setContractOwner(_players[2]);

    const coordinatesPromises = _players.slice(0, 2).map(async (player) => {
      const coordinates = await getUserHitCoordinates(gameAddress, player);
      return { player, coordinates };
    });

    const coordinatesForAllPlayers = await Promise.all(coordinatesPromises);
    const updatedMap = new Map<string, Coordinate[]>();
    coordinatesForAllPlayers.forEach((data) => {
      updatedMap.set(data.player, data.coordinates);
    });
    setMissleCoordinatesByUser(updatedMap);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchGameState(gameAddress, user.address);
  }, [gameAddress, user]);

  const update = async () => {
    await fetchGameState(gameAddress, user!.address);
  };

  return { enemy, contractOwner, missleCoordinatesByUser, update };
};
