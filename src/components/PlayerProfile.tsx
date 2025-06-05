"use client"
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Player } from "@/types/player";
import Image from "next/image";

export default function PlayerProfile() {
  const [playerUsername, setPlayerUsername] = useState("");
  const [opponentUsername, setOpponentUsername] = useState("");

  useEffect(() => {
    let currentPlayer: string;
    let opponent: string;

    const socket = getSocket();

    socket.on("start game", (player: Player, otherPlayer: Player) => {
      socket.id == player.id ? currentPlayer = player.id : opponent = otherPlayer.id;
      socket.id == player.id ? currentPlayer = otherPlayer.id : opponent = player.id;

      setPlayerUsername(currentPlayer);
      setOpponentUsername(opponent);
    })
  }, []);

  return (
    <div className="flex w-full">
      <div>
        <Image src="/user-circle.svg" height={75} width={75} priority={true} alt="user icon" />
        <div>{opponentUsername}</div>
      </div>
      <div>
        <div>{playerUsername}</div>
        <Image src="/user-circle.svg" height={75} width={75} priority={true} alt="user icon" />
      </div>

    </div>
  );
}
