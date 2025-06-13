"use client"
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Player } from "@/types/player";
import Image from "next/image";


export default function GameModal() {

  const [playerInfo, setPlayerInfo] = useState<Player>();
  const [cubeSolved, setCubeSolved] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [playerRanks, setPlayerRanks] = useState<Player[]>([]);

  function displayResults() {
    if (!playerInfo) return;

    const first = playerRanks[0].id == playerInfo.id;
    const opponent = first ? playerRanks[1]: playerRanks[0];


    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex justify-center items-center px-3 py-7 border-2 boreder-green 500">{first ? "You won!" : "You lost"}</div>
        <div className="flex w-full h-full">
          <div className="flex flex-1 flex-col items-center border-2">
            <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
            <div>{opponent.username}</div>
            <div>{opponent.solveTime}</div>
          </div>
          <div className="flex flex-1 flex-col items-center border-2">
            <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
            <div>{playerInfo.username}</div>
            <div>{playerInfo.solveTime}</div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          sdf
        </div>
      </div>
    )
  }

  useEffect(() => {
    const socket = getSocket();

    socket.on("solve complete", (player: Player) => {
      setPlayerInfo(player);
      setCubeSolved(true);
    });

    socket.on("game complete", (rankings: Player[]) => {
      setGameComplete(true);
      setPlayerRanks(rankings);
    })
  }, []);

  return (
    cubeSolved ? (
      <div className="fixed inset-0 z-50 bg-black/50 w-full h-full p-3 flex justify-center items-center">
        <div className="flex justify-center items-center rounded-[20px] border-3 border-red-500 w-[400px] h-[550px] bg-white">
          {gameComplete ? (
            displayResults()
          ) : <div>Awaiting players to finish...</div>
          }
        </div>
      </div>
    ) : null
  );
}
