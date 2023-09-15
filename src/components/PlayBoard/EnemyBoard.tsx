import React, { useEffect, useState } from "react";

import BoardSquare from "./PlayBoardSquare";
import Axis from "../Axis";
import { BOARD_ARR, CURRENT_PLAYER } from "../../utils/DB";
import { Coordinate } from "@/utils/utils";
import { useUser } from "../UserContext";
import { takeAShot } from "@/utils/game";
import { Loader } from "@mantine/core";

const Board = ({
  missileCoordinates,
  gameAddress,
  canShoot,
  setCanShoot,
}: {
  missileCoordinates: Coordinate[];
  gameAddress: string;
  canShoot: boolean;
  setCanShoot: any;
}) => {
  const [currentShot, setCurrentShot] = useState<Coordinate>();

  const playerWallet = useUser();
  const isOcupiedCheck = (rowIndex: number, columnIndex: number) => {
    let shipName = "MISS_HIT";
    let isAttacked = false;
    let isPending = false;
    if (
      missileCoordinates.find(
        (coordinate) => coordinate.x == rowIndex && coordinate.y == columnIndex
      )
    ) {
      isAttacked = true;
      if (
        missileCoordinates.find(
          (coordinate) =>
            coordinate.x == rowIndex && coordinate.y == columnIndex
        )?.isHit
      )
        shipName = "";
    }

    if (currentShot?.x == rowIndex && currentShot?.y == columnIndex) {
      isAttacked = true;
      isPending = true;
    }

    return {
      isOcupied: false,
      shipName,
      isAttacked,
      isPending,
    };
  };

  const handleTakeAShoot = async (x: number, y: number) => {
    if (!canShoot) return;
    setCurrentShot({ x, y });
    setCanShoot(false);
    await takeAShot(gameAddress, x, y, playerWallet!);
  };

  useEffect(() => {
    if (canShoot) setCurrentShot(undefined);
  }, [canShoot]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Enemy board</h1>
      <div className="battleship__content--board--container flex mt-4">
        <Axis direction="row" />
        <Axis direction="column" />
        <div className={`battleship__board`}>
          {BOARD_ARR.map((row, columnIndex) => {
            return row.map((_, rowIndex) => {
              return (
                <BoardSquare
                  divId={`cell_${rowIndex}_${columnIndex}`}
                  onClick={() => handleTakeAShoot(rowIndex, columnIndex)}
                  boardOwner={CURRENT_PLAYER.player}
                  isOcupiedCheck={isOcupiedCheck(rowIndex, columnIndex)}
                  key={`cell_${rowIndex}_${columnIndex}`}
                />
              );
            });
          })}
        </div>
      </div>
      {!canShoot && (
        <div className="flex items-center space-x-2 mt-4">
          <h3>Waiting for enemy shot</h3>
          <Loader variant="bars" />
        </div>
      )}
    </div>
  );
};

export default Board;
