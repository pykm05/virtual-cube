'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { getSocket, Socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PlayHome() {
    const [name, setName] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [socket, setSocket] = useState<Socket>();
    const router = useRouter();

    useEffect(() => {
        const socket = getSocket();
        setSocket(socket);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!socket) return;

        socket.emit('player:initialize', name);

        socket.on('player:initialized', () => {
            socket.emit('room:join_random');
            socket.off('player:initialized');
        });

        socket.on('room:found', (roomID) => {
            console.log('Now joining room ', roomID);
            router.push(`/play/${roomID}`);
            socket.off('room:found');
        });
    };

    return (
        <div className="flex items-center justify-center min-w-[750px] h-full bg-gray-100 text-white">
            <div className="flex justify-center gap-3">
                <div className="flex flex-col w-[250px] h-[500px] rounded-[10px] shadow-md p-3 gap-3 bg-gray-200">
                    <div className="flex items-center gap-[10px]">
                        <Image src="/account_circle.svg" height={65} width={65} priority={true} alt="user icon" />
                        <div className="flex">Guest</div>
                    </div>

                    <button className="py-2 px-4 rounded-[5px] bg-gray-100 hover:bg-gray-50">Solve history</button>

                    <div className="h-full flex border-2 items-center justify-center gap-[10px]">
                        <div className="flex">Your Stats</div>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <div className="flex flex-col w-[350px] h-[500px] rounded-[10px] shadow-md justify-center items-center gap-3 bg-gray-200">
                        <div className="text-white font-bold font-inter text-3xl">Virtual Cube</div>
                        <div className="text-white font-inter text-s">Welcome, Guest!</div>
                        <br />
                        <button className="w-[300px] py-2 px-4 rounded-l mb-5 bg-purple-100 hover:bg-purple-50">
                            Play
                        </button>
                        <button className="w-[300px] py-2 px-4 rounded-l bg-gray-100 hover:bg-gray-50">
                            Leaderboard
                        </button>
                        <button className="w-[300px] py-2 px-4 rounded-l bg-gray-100 hover:bg-gray-50">
                            How to play
                        </button>
                    </div>
                </div>

                <div className="flex flex-col w-[250px] h-full rounded shadow-md p-3 gap-3 bg-gray-200">
                    <div className="flex border-2 items-center gap-[10px]">
                        <Image src="/account_circle.svg" height={50} width={50} priority={true} alt="user icon" />
                        <div className="flex">Singleplayer</div>
                    </div>
                    <div className="flex border-2 items-center gap-[10px]">
                        <Image src="/account_circle.svg" height={50} width={50} priority={true} alt="user icon" />
                        <div className="flex">Casual</div>
                    </div>
                    <div className="flex border-2 items-center gap-[10px]">
                        <Image src="/account_circle.svg" height={50} width={50} priority={true} alt="user icon" />
                        <div className="flex">Ranked</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
