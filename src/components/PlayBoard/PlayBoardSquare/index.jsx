import React from "react";
import { CURRENT_PLAYER, MISS_HIT } from "../../../utils/DB";

const BoardSquare = ({ onClick, isOcupiedCheck, boardOwner, divId }) => {
  const { isOcupied, isPending, shipName, isAttacked } = isOcupiedCheck;
  let missBlock = false;
  let boardAttackDeployClass = "";

  if (shipName === MISS_HIT && isAttacked) {
    missBlock = true;
    boardAttackDeployClass = "miss";
  } else if (isAttacked) {
    boardAttackDeployClass = "hit";
  } else if (shipName !== MISS_HIT && isOcupied) {
    boardAttackDeployClass =
      boardOwner === CURRENT_PLAYER.computer ? "" : shipName;
  }

  return (
    <div
      id={divId}
      onClick={() => {
        if (isAttacked || missBlock) {
          return;
        }

        onClick();
      }}
      disabled={isAttacked || missBlock}
      className={`board__square ${boardAttackDeployClass} ${isPending ? 'animate-ping': ''}`}
    ></div>
  );
};

BoardSquare.displayName = "BoardSquare";

export default BoardSquare;
