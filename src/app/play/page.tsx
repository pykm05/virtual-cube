"use client"
import { getSocket } from "@/socket";
import { useRouter } from "next/navigation";

export default function PlayHome() {

    const router = useRouter();

    function handleClick() {
        const socket = getSocket();

        socket.emit("join room");

        socket.on("join room", (roomID) => {
            console.log("now joining room ", roomID);
            router.push(`play/${roomID}`);
        })
    }

    return (
        <div className="flex w-screen h-screen justify-center items-center border-2 border-red">
            <div className="flex flex-col w-[500px] h-[500px] justify-center items-center border-2 border-green-400">
                <div className="flex flex-col items-center justify-center gap-[30px]">
                    <h1 className="min-w-[200px] text-[50px]">Virtual Cube</h1>
                    <input type="text" className="px-2 py-0.5 border-2" autoComplete="off" placeholder="enter username" maxLength={30} />
                    <button onClick={() => handleClick()} className="px-3 border-2 rounded-[10px]">Play</button>
                </div>
            </div>
        </div>
    );
}