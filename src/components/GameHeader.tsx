"use client"
import { useEffect, useState } from "react";
import { getSocket } from "@/socket";

enum RoomState {
  GAME_NOT_STARTED = "Game not started",
  INSPECTION_TIME = "Cube inspection",
  SOLVE_IN_PROGRESS = "Solve in progress",
  GAME_ENDED = "Game complete"
}

export default function Game() {
  const [roomState, setRoomState] = useState(RoomState.GAME_NOT_STARTED);

  useEffect(() => {
    const socket = getSocket();

    socket.on("inspection time", () => {
      setRoomState(RoomState.INSPECTION_TIME);
    });

    socket.on("begin solve", () => {
      setRoomState(RoomState.SOLVE_IN_PROGRESS);
    });

    socket.on("game ended", () => {
      setRoomState(RoomState.GAME_ENDED);
    })
  }, []);

  useEffect(() => {
    switch(roomState) {
      case RoomState.GAME_NOT_STARTED:
        break;
      case RoomState.INSPECTION_TIME:
        break;
      case RoomState.SOLVE_IN_PROGRESS:
        break;
      case RoomState.GAME_ENDED:

    }
  }, [roomState])

  return (
    <div className="flex justify-center w-full h-full border-2 border-red-500 p-5 bg-purple-800 text-white">{roomState}</div>
  );
}
