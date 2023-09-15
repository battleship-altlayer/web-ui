"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

import Axis from "./Axis";
import Board from "./DeployBoard";
import Inventory from "./Inventory";
import Sound from "./Sound";

import { SHIPS, AXIS, CURRENT_PLAYER, MISS_HIT } from "../utils/DB";
import {
  hasEnoughBlocksToDeploy,
  getOccupiableBlocks,
  isPlaceTakenByOtherShip,
  getRandomOcupiableBlock,

  getShipNameByCoordinates,
  isArraysEqual,
} from "../utils/helper";
import { useUser } from "./UserContext";
import JoinGameButton from "./JoinGameButton";

const Battleship = ( { gameAddress } ) => {
  const [selectedShipToPlace, setSelectedShipToPlace] = useState(null);
  const currentPlayerRef = useRef(CURRENT_PLAYER.player);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const currenPlayerWallet = useUser();

  // player states
  const [playerAvailableShips, setPlayerAvailableShips] = useState(SHIPS);
  const [playersSelectedAxis, setPlayersSelectedAxis] = useState(
    AXIS.horizontal
  );
  const [playerDeployedShips, setPlayerDeployedShips] = useState([]);

  // computer states
  const [computerAvailableShips, setComputerAvailableShips] = useState(SHIPS);
  const [computerDeployedShips, setComputerDeployedShips] = useState([]);

  const sunkSoundRef = useRef(null);
  const clickSoundRef = useRef(null);
  const lossSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  useEffect(() => {
    if (hasGameStarted) {
      checkForWinner(computerDeployedShips, CURRENT_PLAYER.computer);
      checkForWinner(playerDeployedShips, CURRENT_PLAYER.player);
    }
  }, [hasGameStarted, computerDeployedShips, playerDeployedShips]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkForWinner = (ships, player) => {
    const { isAllSunk, winner } = getWinner(ships, player);
    if (isAllSunk) {
      playSound(winner === "Player" ? "win" : "lose");
      Swal.fire(`Winner is ${winner}`).then(() => resetGame());
    }
  };

  const stopSound = (sound) => {
    sound.current.pause();
    sound.current.currentTime = 0;
  };

  const playSound = (sound) => {
    if (sound === "sunk") {
      stopSound(sunkSoundRef);
      sunkSoundRef.current.play();
    }

    if (sound === "click") {
      stopSound(clickSoundRef);
      clickSoundRef.current.play();
    }

    if (sound === "lose") {
      stopSound(lossSoundRef);
      lossSoundRef.current.play();
    }

    if (sound === "win") {
      stopSound(winSoundRef);
      winSoundRef.current.play();
    }
  };

  const getWinner = (deployedShips, boardOwner) => {
    let winner = "";
    let isAllSunk = false;
    if (deployedShips && deployedShips.length > 0) {
      let winnersShipsNumber = 0;
      deployedShips.forEach((ship) => {
        if (ship.isShipSunk) {
          winnersShipsNumber++;
        }
      });

      if (winnersShipsNumber === SHIPS.length) {
        isAllSunk = true;
        if (boardOwner === CURRENT_PLAYER.player) {
          winner = "Computer";
        } else {
          winner = "Player";
        }
      }
    }

    return { isAllSunk, winner };
  };
  const resetGame = () => {
    setPlayerAvailableShips(SHIPS);
    setComputerAvailableShips(SHIPS);

    setSelectedShipToPlace(null);
    currentPlayerRef.current = CURRENT_PLAYER.player;
    setHasGameStarted(false);
    setPlayersSelectedAxis(AXIS.horizontal);
    setPlayerDeployedShips([]);
    setComputerDeployedShips([]);
  };

  const handleSelectShipToPlace = (ship) => {
    setSelectedShipToPlace(ship);
  };

  const onSelectAxis = (axis) => {
    setPlayersSelectedAxis(axis);
    setSelectedShipToPlace(null);
  };

  const onClickBoradSquare = ({ rowIndex, columnIndex, clickedShip }) => {
    if (hasGameStarted) {
      if (currentPlayerRef.current === CURRENT_PLAYER.player) {
        playSound("click");
        handleMissileAttackOnBoard(rowIndex, columnIndex, clickedShip);
      }

      return;
    }
    if (!hasGameStarted && playerDeployedShips.length === SHIPS.length) {
      Swal.fire("Its time to fire the missiles captain");
    } else {
      if (selectedShipToPlace) {
        const isHorizontal = playersSelectedAxis === AXIS.horizontal;
        if (
          hasEnoughBlocksToDeploy(
            isHorizontal,
            selectedShipToPlace.shipLength,
            rowIndex,
            columnIndex
          )
        ) {
          const occupiedBlocks = getOccupiableBlocks(
            isHorizontal,
            rowIndex,
            columnIndex,
            selectedShipToPlace.shipLength
          );

          if (
            isPlaceTakenByOtherShip(playerDeployedShips, occupiedBlocks)
              .isPlaceTaken
          ) {
            Swal.fire("Block already taken!!");
            return;
          }
          const deployableShipObj = {
            shipName: selectedShipToPlace.name,
            shipLength: selectedShipToPlace.shipLength,
            occupiedBlocks,
            isHorizontal,
            currentPlayer: currentPlayerRef.current,
            attackedBlocks: [],
            isShipSunk: false,
          };
          setPlayerDeployedShips([...playerDeployedShips, deployableShipObj]);

          const newPlayerAvailableShips = playerAvailableShips.filter(
            (ship) => ship.name !== selectedShipToPlace.name
          );

          setPlayerAvailableShips(newPlayerAvailableShips);
          setSelectedShipToPlace(null);
          playSound("click");
        } else {
          Swal.fire("Can not place ship here!!");
        }
      } else {
        Swal.fire("Please select your ship first!!");
      }
    }
  };

  // const handleGameStart = () => {
  //   if (hasGameStarted) {
  //     Swal.fire("Are you sure to restart the game").then(() => resetGame());
  //   } else {
  //     joinGame(
  //       router.query.address,
  //       playerDeployedShips,
  //       currenPlayerWallet
  //     );
  //     setHasGameStarted(true);
  //     deployShipsForComputer();
  //   }
  // };

  // randomly deploy ships on the board
  const deployShipsForComputer = () => {
    let tempAvShip = [...computerAvailableShips];
    let tempDeployedArr = [];
    while (tempAvShip?.length > 0) {
      const isHorizontal = Math.random() < 0.5 ? true : false; // ?

      let block = getRandomOcupiableBlock(tempAvShip[0], isHorizontal);
      if (isPlaceTakenByOtherShip(tempDeployedArr, block).isPlaceTaken) {
        block = getRandomOcupiableBlock(tempAvShip[0], isHorizontal);
      } else {
        const deployableShipObj = {
          shipName: tempAvShip[0].name,
          shipLength: tempAvShip[0].shipLength,
          occupiedBlocks: block,
          isHorizontal,
          currentPlayer: currentPlayerRef.current,
          attackedBlocks: [],
          isShipSunk: false,
        };
        tempDeployedArr = [...tempDeployedArr, deployableShipObj];
        tempAvShip.shift();
      }
    }

    if (tempDeployedArr.length === 4) {
      setComputerAvailableShips([]);
      setComputerDeployedShips(tempDeployedArr);
      startAttackNow();
    }
  };

  const startAttackNow = () => {
    let timerInterval;
    Swal.fire({
      title:
        "Put the force at weapons posture one, warning red, weapons tight, Admiral",
      html: "You can attack in <b></b> seconds.",
      timer: 5000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
          b.textContent = Math.floor(Swal.getTimerLeft() / 1000);
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
      }
    });
  };

  const handleMissileAttackOnBoard = (rowIndex, columnIndex, clickedShip) => {
    const cordinationXY = `${rowIndex}${columnIndex}`;
    let newDeployedArr = [];
    const targetBoardShips =
      currentPlayerRef.current === CURRENT_PLAYER.player
        ? computerDeployedShips
        : playerDeployedShips;
    let targetShipName = clickedShip;

    if (currentPlayerRef.current === CURRENT_PLAYER.computer) {
      // check if any ship available
      targetShipName = getShipNameByCoordinates(
        playerDeployedShips,
        cordinationXY
      );
    }
    if (targetShipName !== "") {
      newDeployedArr = targetBoardShips.map((ship) => {
        if (ship?.shipName === targetShipName) {
          if (ship.attackedBlocks.length > 0) {
            if (ship.attackedBlocks.includes(cordinationXY)) {
              return;
            }
            const newAttackedBlocks = [...ship.attackedBlocks, cordinationXY];
            const isShipSunk = isArraysEqual(
              newAttackedBlocks,
              ship.occupiedBlocks
            );

            if (isShipSunk) {
              playSound("sunk");
            }

            return {
              ...ship,
              attackedBlocks: newAttackedBlocks,
              isShipSunk,
            };
          } else {
            return {
              ...ship,
              attackedBlocks: [`${rowIndex}${columnIndex}`],
              isShipSunk: false,
            };
          }
        } else {
          return ship;
        }
      });
    } else {
      newDeployedArr = [
        ...targetBoardShips,
        { shipName: MISS_HIT, attackedBlocks: [`${rowIndex}${columnIndex}`] },
      ];
    }

    if (currentPlayerRef.current === CURRENT_PLAYER.player) {
      setComputerDeployedShips(newDeployedArr);
    } else {
      setPlayerDeployedShips(newDeployedArr);
    }
    // changing current player
    console.log(
      "changing current player",
      currentPlayerRef.current === CURRENT_PLAYER.player
        ? CURRENT_PLAYER.computer
        : CURRENT_PLAYER.player
    );

    currentPlayerRef.current =
      currentPlayerRef.current === CURRENT_PLAYER.player
        ? CURRENT_PLAYER.computer
        : CURRENT_PLAYER.player;
  };

  const handleMissleFromEnemy = (rowIndex, columnIndex) => {
    setTimeout(() => {
      console.log("handleMissleFromEnemy: ", rowIndex, columnIndex);
      const { shipName } = isPlaceTakenByOtherShip(
        playerDeployedShips,
        `${rowIndex}${columnIndex}`
      );
      handleMissileAttackOnBoard(rowIndex, columnIndex, shipName);
    }, 0);
  };

  return (
    <div className="battleship__stage">
      <Sound
        sunkSoundRef={sunkSoundRef}
        clickSoundRef={clickSoundRef}
        lossSoundRef={lossSoundRef}
        winSoundRef={winSoundRef}
      />

      <div className="battleship__content text-white flex flex-col items-center">
        <Inventory
          title="Inventory"
          playerAvailableShips={playerAvailableShips}
          handleSelectShipToPlace={handleSelectShipToPlace}
          selectedShipToPlace={selectedShipToPlace}
          playersSelectedAxis={playersSelectedAxis}
          onSelectAxis={onSelectAxis}
        />
        <div className="battleship__content--board--container flex mt-4">
          <Axis direction="row" />
          <Axis direction="column" />
          <Board
            hasGameStarted={hasGameStarted}
            selectedShipToPlace={selectedShipToPlace}
            onClickBoradSquare={onClickBoradSquare}
            deployedShips={playerDeployedShips}
            boardOwner={CURRENT_PLAYER.player}
          />
        </div>
        <JoinGameButton
          gameAddress={gameAddress}
          playerDeployedShips={playerDeployedShips}
        />
      </div>
    </div>
  );
};

Battleship.displayName = "Battleship";

export default Battleship;
