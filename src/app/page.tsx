'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import InstructionsModal from '@/components/instruction';
import LeaderboardModal from '@/components/leaderboard';
import { getSocket, Socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type user = {
    loggedIn: boolean;
    username: string;
};

export default function PlayHome() {
    const [userInfo, setUserInfo] = useState<user>({ loggedIn: false, username: 'Guest' });
    const [showInstructions, setShowInstructions] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [gameMode, setGameMode] = useState('Unrated');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [socket, setSocket] = useState<Socket>();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            if (isSubmitting) return;
            setIsSubmitting(true);

            const socket = getSocket();
            setSocket(socket);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-user`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!res.ok) {
                    return;
                }

                const json = await res.json();
                console.log(json);

                setUserInfo({ loggedIn: true, username: json.data.username });
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsSubmitting(false);
            }
        };

        init();
    }, []);

    const play = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('sdfdsf');

        if (!socket) return;

        socket.emit('player:initialize', userInfo.username);

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
                {/* Account information */}
                <div className="flex flex-col w-[250px] h-[500px] p-4 gap-3 rounded-[10px] shadow-lg bg-gray-200">
                    <div className="flex items-center gap-[10px] p-3">
                        <Image src="/user.svg" height={30} width={30} priority={true} alt="user icon" />
                        <div>{userInfo.username}</div>
                    </div>
                    {!userInfo.loggedIn ? (
                        <button
                            onClick={() => router.push('/login')}
                            className="py-2 px-4 rounded-[5px] bg-gray-100 hover:bg-gray-50"
                        >
                            Login / Signup
                        </button>
                    ) : null}
                    <div className="items-center justify-center h-full bg-gray-100 flex gap-[10px]">
                        {!userInfo.loggedIn ? <div>Log in to view stats</div> : <div>Player stats</div>}
                    </div>
                </div>

                {/* Main componenet */}
                <div className="flex items-center justify-center">
                    <div className="flex flex-col w-[350px] h-[500px] rounded-[10px] shadow-lg justify-center items-center gap-3 bg-gray-200">
                        <div className="text-white font-bold font-inter text-3xl">Virtual Cube</div>
                        <div className="text-white font-inter text-s">Welcome, {userInfo.username}!</div>
                        <br />
                        <button
                            onClick={play}
                            className="w-[300px] py-2 px-4 rounded-l mb-5 bg-purple-100 hover:bg-purple-50"
                        >
                            Play
                        </button>
                        <button className="w-[300px] py-2 px-4 rounded-l bg-gray-100 hover:bg-gray-50">
                            Leaderboard
                        </button>
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="w-[300px] py-2 px-4 rounded-l bg-gray-100 hover:bg-gray-50"
                        >
                            How to play
                        </button>
                    </div>
                </div>

                {/* Game mode select */}
                <div className="flex flex-col w-[200px] h-full rounded-[10px] text-sm rounded shadow-lg p-3 gap-2 bg-gray-200">
                    <button
                        onClick={() => setGameMode('Singleplayer')}
                        className={`flex items-center px-2 py-1 rounded-[5px] gap-[10px]
                            ${gameMode === 'Singleplayer' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                    >
                        <Image src="/clock.svg" height={30} width={30} priority={true} alt="user icon" />
                        <div>Singleplayer</div>
                    </button>
                    <button
                        onClick={() => setGameMode('Unrated')}
                        className={`flex items-center px-2 py-1 rounded-[5px] gap-[10px]
                            ${gameMode === 'Unrated' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                    >
                        <Image src="/controller.svg" height={30} width={30} priority={true} alt="user icon" />
                        <div>Unrated</div>
                    </button>
                    <button
                        onClick={() => setGameMode('Ranked')}
                        className={`flex items-center px-3 py-2 rounded-[5px] gap-[15px]
                            ${gameMode === 'Ranked' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                    >
                        <Image src="/swords.svg" height={20} width={20} priority={true} alt="user icon" />
                        <div>Ranked</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
