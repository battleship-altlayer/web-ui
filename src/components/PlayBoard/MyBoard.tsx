import React, { useEffect } from "react";

import BoardSquare from "./PlayBoardSquare";
import Axis from "../Axis";
import { BOARD_ARR, CURRENT_PLAYER, MISS_HIT } from "../../utils/DB";

const Board = ({ missileCoordinates }: { missileCoordinates: any[] }) => {
  const deployedShips: any[] = JSON.parse(
    localStorage.getItem("playerDeployedShips") || "[]"
  );
  const isOcupiedCheck = (rowIndex: number, columnIndex: number) => {
    let flag = false;
    let shipName = "";
    let isAttacked = false;
    const currentRowColumnIndex = `${rowIndex}${columnIndex}`;
    deployedShips &&
      deployedShips.forEach((ship) => {
        if (
          ship?.shipName !== MISS_HIT &&
          ship.occupiedBlocks.includes(currentRowColumnIndex)
        ) {
          flag = true;
          shipName = ship?.shipName;
          isAttacked = ship.attackedBlocks.includes(currentRowColumnIndex)
            ? true
            : false;
        }
      });
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
      ) {
        shipName = "";
      } else {
        shipName = MISS_HIT;
      }
    }
    return {
      isOcupied: flag,
      shipName,
      isAttacked,
    };
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Your board</h1>
      <div className="battleship__content--board--container flex mt-4">
        <Axis direction="row" />
        <Axis direction="column" />
        <div className={`battleship__board disbale-block`}>
          {BOARD_ARR.map((row, columnIndex) => {
            return row.map((_, rowIndex) => {
              return (
                <BoardSquare
                  divId={`cell_${rowIndex}_${columnIndex}`}
                  onClick={() => undefined}
                  boardOwner={CURRENT_PLAYER.player}
                  isOcupiedCheck={isOcupiedCheck(rowIndex, columnIndex)}
                  key={`cell_${rowIndex}_${columnIndex}`}
                />
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;
