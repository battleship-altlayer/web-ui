"use client";
import AddressBox from "@/components/AddressBox";
import { useUser } from "@/components/UserContext";
import { deployGame } from "@/utils/game";
import { ActionIcon, Loader, TextInput } from "@mantine/core";
import { useState } from "react";

export default function Home() {
  const currentUser = useUser();
  const [enemyAddress, setEnemyAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGameStart = async () => {
    setLoading(true);
    console.log("currentUser", currentUser!.address);
    console.log("enemyAddress", enemyAddress);

    const gameAddress = await deployGame(enemyAddress, currentUser!.privateKey);
    console.log(gameAddress);

    //redirect to /game/[address]
    window.location.href = `/game/${gameAddress}/join`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <AddressBox address={currentUser?.address!} />
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-300 dark:to-green-300">
              Voyage
            </h1>
          </a>
        </div>
      </div>

      <div className="relative my-auto flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <div className="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
          <div
            className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"
            style={{ backgroundPosition: "10px 10px" }}
          ></div>
          <div className="relative rounded-xl overflow-auto p-8">
            <div className="flex justify-center gap-4 text-white text-sm text-center font-bold leading-6">
              <div className="flex flex-col items-center shrink-0">
                <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-300 dark:to-green-300">
                  Enemy address
                </h1>
                <TextInput
                  size="lg"
                  withAsterisk
                  placeholder="0x000000000"
                  value={enemyAddress}
                  mt={12}
                  w={500}
                  onChange={(event) =>
                    setEnemyAddress(event.currentTarget.value)
                  }
                />
                <button
                  disabled={loading}
                  className="px-4 py-2 mt-4 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm flex space-x-2 items-center justify-center"
                  onClick={handleGameStart}
                >
                  {loading && <Loader size="xs" color="white" />}
                  Start game
                </button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"></div>
        </div>
      </div>
    </main>
  );
}
