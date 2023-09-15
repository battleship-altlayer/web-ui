import { gameContractWithProvider, joinGame } from "@/utils/game";
import { Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as React from "react";
import Swal from "sweetalert2";
import { useUser } from "./UserContext";

interface IJoinGameButtonProps {
  gameAddress: string;
  playerDeployedShips: any[];
}

const JoinGameButton: React.FunctionComponent<IJoinGameButtonProps> = ({
  gameAddress,
  playerDeployedShips,
}) => {
  const [loading, setLoading] = React.useState(false);

  const [joined, setJoined] = React.useState(false);

  const currenPlayerWallet = useUser();
  const handleJoinGame = async () => {
    if (joined) {
      notifications.show({
        title: "You already joined this game",
        message: "Wait for enemy deploy their ships",
        color: "red",
      });
      return;
    }
    setLoading(true);
    await joinGame(gameAddress, playerDeployedShips, currenPlayerWallet!);
    setLoading(false);
    setJoined(true);
  };

  const startAttackNow = () => {
    let timerInterval: any;
    Swal.fire({
      title:
        "Put the force at weapons posture one, warning red, weapons tight, Admiral",
      html: "You can attack in <b></b> seconds.",
      timer: 5000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer()!.querySelector("b")!;
        timerInterval = setInterval(() => {
          b.textContent = Math.floor(Swal.getTimerLeft()! / 1000) as any;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
        window.location.href = `/game/${gameAddress}/play`;
      },
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
      }
    });
  };

  React.useEffect(() => {
    const contract = gameContractWithProvider(gameAddress);

    const subscribeToEvents = async () => {
      if (contract) {
        gameContractWithProvider(gameAddress).on("GameStarted", (args) => {
          console.log("GameStarted event: ", args);
          startAttackNow();
        });
      }
    };

    subscribeToEvents();

    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [gameAddress]);

  return (
    <div className="flex flex-col items-center">
      <button
        disabled={loading}
        className="px-4 py-2 mt-4 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm flex space-x-2 items-center justify-center"
        onClick={handleJoinGame}
      >
        {loading && <Loader size="xs" color="white" />}
        Start game
      </button>
      {joined && (
        <p className="text-center text-white text-md mt-4">
          Wait for enemy deploy their ships
          <Loader mx="auto" />
        </p>
      )}
      <a
        href={`https://zero-explorer.alt.technology/address/${gameAddress}`}
        className="mt-12 underline"
      >
        See game contract on explorer
      </a>
    </div>
  );
};

export default JoinGameButton;
