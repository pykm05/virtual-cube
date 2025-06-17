"use client"
import { useEffect, useState } from "react";
import { getSocket, getPlayerOrder } from "@/lib/socket";
import { Cube } from "@/components/three/cube";
import Scene from "@/components/three/scene";
import { Player } from "@/types/player";
import Image from "next/image";

export default function GameWindow() {
  const [players, setPlayers] = useState<Player[]>([]);

  function newScene(container: HTMLElement, assignedSocketID: string) {
    const { scene, renderer, camera } = Scene(container);
    const cube = new Cube(scene, renderer, camera);
  
    const socket = getSocket();
    const emitter = socket.id == assignedSocketID;
  
    if (emitter) window.addEventListener("keydown", (e) => socket.emit("keyboard input", socket.id, e.key));
  
    socket.on("keyboard input", async (socketID: string, key: string) => {
      if ((emitter && socket.id == socketID) || (!emitter && assignedSocketID == socketID)) {
        cube.handleInput(key);
  
        // long
        if (emitter && await cube.isSolved() && key != ';' && key != 'a' && key != 'y' && key != 'b' && key != 'p' && key != 'q') {
          socket.emit("solve complete", socket.id);
          socket.off("keyboard input");
        }
      }
    });
  }

  useEffect(() => {
    const socket = getSocket();

    socket.on("start game", (users: Player[]) => {
      setPlayers(getPlayerOrder(users));
    });

    socket.on("remove player", (socketID: string) => {
      // console.log(socketID, "was removed")
      // setPlayers(players.filter(player => player.id !== socketID));
    });
  }, []);

  useEffect(() => {
    for (let i = 0; i < players.length; i++) {
      const userID = players[i].id;
      const element = document.getElementById(userID);
      if (element) {
        newScene(element, userID);
      }
    }

    console.log('new render')
  }, [players]);

  return (
    <div className="flex justify-center w-screen h-screen">
      {players.map((user: Player) => (
        user && <div key={user.id} className="flex flex-1 flex-col">
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
