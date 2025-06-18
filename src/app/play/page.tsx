"use client";
import { getSocket, Socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlayHome() {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState<Socket>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!socket || !username.trim() || isLoading) return;

    setIsLoading(true);
    try {
      socket.emit("initialize player", username.trim());
      socket.emit("search room");
      socket.on("room found", (roomID) => {
        router.push(`play/${roomID}`);
        socket.off("room found");
      });
    } catch (error) {
      console.error("Error joining room:", error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") handleSubmit();
  };

  useEffect(() => {
    const socket = getSocket();
    setSocket(socket);
    return () => {
      socket?.off("room found");
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center space-y-5">
          <h1 className="text-3xl font-semibold">Virtual Cube</h1>
          <p className="text-gray-400 text-sm">
            Enter your username to start playing
          </p>

          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="peer bg-transparent h-10 w-full rounded-md text-white placeholder-transparent ring-2 ring-gray-700 px-3 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="Username"
              maxLength={30}
              autoComplete="off"
            />
            <label
              htmlFor="username"
              className="absolute left-3 -top-3 text-sm text-white bg-gray-900 px-1 cursor-text
      peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-white
      peer-focus:-top-3 peer-focus:text-indigo-500 peer-focus:text-sm transition-all"
            >
              Username
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!username.trim() || isLoading}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-all duration-200 transform hover:shadow-md disabled:cursor-not-allowed text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Finding Room...</span>
              </div>
            ) : (
              <span>Start Playing</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
