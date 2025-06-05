"use client"
import { useEffect, useState } from "react";
import { getSocket, getPlayerOrder } from "@/lib/socket";
import newScene from "@/lib/gameInstance";
import { Player } from "@/types/player";

export default function GameWindow() {
  const [roomUsers, setRoomUsers] = useState<Player[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("start game", (users: Player[]) => {
      setRoomUsers(getPlayerOrder(users));
    });
  }, []);

  useEffect(() => {
    for (let i = 0; i < roomUsers.length; i++) {
      const userID = roomUsers[i].id;
      const element = document.getElementById(userID);
      if (element) {
        newScene(element, userID);
      }
    }
  }, [roomUsers]);

  return (
    <div className="flex justify-center w-screen h-screen">
      {roomUsers.map((user: Player) => (
        <div
          key={user.id}
          id={user.id}
          className="flex-1 w-[75%] h-[75%] border-2 border-white"
        />
      ))}
    </div>
  );
}
