"use client"
import { useEffect } from "react";
import { getSocket } from "@/socket";
import gameInstance from "@/game/gameInstance";
import { Player } from "@/server/player";

export default function Game() {

  useEffect(() => {
    const socket = getSocket();

    socket.on("start game", (player: Player, otherPlayer: Player) => {
      gameInstance(document.getElementById("playerScene")!, socket.id == player.id ? player.id : otherPlayer.id);
      gameInstance(document.getElementById("opponentScene")!, socket.id == player.id ? otherPlayer.id : player.id);
    })
  }, []);

  return (
    <div className="flex justify-center border-2 border-green-700 w-screen h-screen">
      <div id="playerScene" className="flex-1 w-[75%] h-[75%] border-2 border-white" />
      <div id="opponentScene" className="flex-1 w-[75%] h-[75%] border-2 border-white" />
    </div>
  );
}
