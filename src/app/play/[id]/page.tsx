"use client"
import { useEffect} from "react";
import { getSocket } from "@/socket";
import { useRouter } from "next/navigation";
import Game from "@/components/Game";

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
    <div className="flex justify-center items-center border-2 border-green-700 w-screen h-screen">
      <Game />
    </div>
  );
}
