"use client"
import { useEffect} from "react";
import { getSocket } from "@/socket";
import { useRouter } from "next/navigation";
import Game from "@/components/Game";
import GameHeader from "@/components/GameHeader";

export default function PlayerWindow() {

  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();

    socket.emit("user joined");

    socket.on("invalid join", () => {
      router.push("./");
  });
  }, []);

  return (
    <div className="flex flex-col border-2 border-red-800 w-screen h-screen">
      <GameHeader />
      <Game />
    </div>
  );
}
