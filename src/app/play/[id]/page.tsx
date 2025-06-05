"use client"
import { useEffect} from "react";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import GameWindow from "@/components/GameWindow";
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
      <GameWindow />
    </div>
  );
}
