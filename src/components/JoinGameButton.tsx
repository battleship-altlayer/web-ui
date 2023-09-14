import { gameContractWithProvider, joinGame } from "@/utils/game";
import { Loader } from "@mantine/core";
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

  const currenPlayerWallet = useUser();
  const handleJoinGame = async () => {
    setLoading(true);
    await joinGame(gameAddress, playerDeployedShips, currenPlayerWallet!);
    setLoading(false);
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
        window.location.href = `/game/${gameAddress}/attack`;
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
    <button
      disabled={loading}
      className="px-4 py-2 mt-4 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm flex space-x-2 items-center justify-center"
      onClick={handleJoinGame}
    >
      {loading && <Loader size="xs" color="white" />}
      Start game
    </button>
  );
};

export default JoinGameButton;
