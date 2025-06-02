"use client"
import { useEffect } from "react";
import { getSocket } from "@/socket";
import gameInstance from "@/game/gameInstance";

export default function Game() {

  useEffect(() => {
    const socket = getSocket();

    socket.on("start game", (socketIdOne: string, socketIdTwo: string) => {
      gameInstance(document.getElementById("playerScene")!, socket.id == socketIdOne ? socketIdOne : socketIdTwo);
      gameInstance(document.getElementById("opponentScene")!, socket.id == socketIdOne ? socketIdTwo : socketIdOne);
    })
  }, []);

  return (
    <div className="flex justify-center border-2 border-green-700 w-screen h-screen">
      <div id="playerScene" className="flex-1 w-[75%] h-[75%] border-2 border-white" />
      <div id="opponentScene" className="flex-1 w-[75%] h-[75%] border-2 border-white" />
    </div>
  );
}
