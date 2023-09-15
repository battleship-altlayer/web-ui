"use client";
import Axis from "@/components/Axis";
import EnemyBoard from "@/components/PlayBoard/EnemyBoard";
import MyBoard from "@/components/PlayBoard/MyBoard";
import { useUser } from "@/components/UserContext";
import { useGameState } from "@/hooks/useGameState";
import { CURRENT_PLAYER } from "@/utils/DB";
import {
  endTurn,
  gameContractWithProvider,
  handleReportHits,
} from "@/utils/game";
import * as React from "react";

interface IPageProps {
  params: {
    address: string;
  };
}

const Page: React.FunctionComponent<IPageProps> = (props) => {
  const user = useUser();
  const { enemy, contractOwner, missleCoordinatesByUser, update } =
    useGameState(props.params.address, user);
  const [canShoot, setCanShoot] = React.useState(true);

  React.useEffect(() => {
    const contract = gameContractWithProvider(props.params.address);

    if (!contract || !enemy || !props.params.address || !user || !update) {
      return;
    }

    const handleLastTurnShot = (args: any) => {
      console.log("LastTurnShot event: ", args);
      handleReportHits(props.params.address, enemy!, user!);
    };

    const handleLastTurnReport = (args: any) => {
      console.log("LastTurnReport event: ", args);
      if (user.address === contractOwner) endTurn(props.params.address, user);
      update().then(() => {
        setCanShoot(true);
      });
    };

    contract.off("LastTurnShot", handleLastTurnShot);
    contract.off("LastTurnReport", handleLastTurnReport);

    contract.on("LastTurnShot", handleLastTurnShot);
    contract.on("LastTurnReport", handleLastTurnReport);

    return () => {
      contract.off("LastTurnShot", handleLastTurnShot);
      contract.off("LastTurnReport", handleLastTurnReport);
    };
  }, [enemy, props.params.address, contractOwner, user, update]);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => endTurn(props.params.address, user!)}
        className="absolute bottom-0 right-0"
      >
        force end turn
      </button>
      <div className="flex space-x-4 justify-around">
        {user && enemy ? (
          <>
            <MyBoard
              missileCoordinates={
                missleCoordinatesByUser.get(user?.address) || []
              }
            />
            <EnemyBoard
              missileCoordinates={missleCoordinatesByUser.get(enemy) || []}
              gameAddress={props.params.address}
              canShoot={canShoot}
              setCanShoot={setCanShoot}
            />
          </>
        ) : (
          "...loading"
        )}
      </div>
      <a
        href={`https://zero-explorer.alt.technology/address/${props.params.address}`}
        className="mt-12 underline"
      >
        See game contract on explorer
      </a>
    </div>
  );
};

export default Page;
