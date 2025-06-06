"use client"
import { useEffect, useState } from "react";
import { getSocket, getPlayerOrder } from "@/lib/socket";
import newScene from "@/lib/gameInstance";
import { Player } from "@/types/player";
import Image from "next/image";

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
        <div key={user.id} className="flex flex-1 flex-col">
          <div className="flex items-center px-3 w-full gap-[20px]">
            <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
            <div>{user.username ? user.username : "an unnamed cuber"}</div>
          </div>
          <div id={user.id} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}
