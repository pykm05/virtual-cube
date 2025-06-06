"use client"
import { useEffect, useState } from "react";
import { getSocket, getPlayerOrder } from "@/lib/socket";
import { Player } from "@/types/player";

export default function GameWindow() {
  const [gameOver, setGameOver] = useState(false);
  const [roomUsers, setRoomUsers] = useState<Player[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("start game", (users: Player[]) => {
      setRoomUsers(getPlayerOrder(users));
    });

    socket.on("game complete", () => {
      setGameOver(true);
    })
  }, []);

  return (
    gameOver ? (
      <div className="fixed inset-0 z-50 bg-black/50 w-full h-full p-3 flex justify-center items-center">
        <div className="flex justify-center items-center rounded-[30px] border-3 border-red-500 w-[400px] h-[550px] bg-white">game over</div>
      </div> 
    ) : null
  );
}
