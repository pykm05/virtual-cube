'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { getSocket, Socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlayerStats from '@/components/menu/PlayerStats';
import { useAuth } from '@/context/AuthContext';

type SolveData = {
    scramble: string;
    solve_duration: number;
    solved_at: string;
};

export default function PlayHome() {
    const [gameMode, setGameMode] = useState('Unrated');
    const [solveData, setSolveData] = useState<SolveData[]>([]);
    const [socket, setSocket] = useState<Socket>();

    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = async () => {
        // Push before logging out
        router.push('/login');

        await logout();
    };

    useEffect(() => {
        const socket = getSocket();
        setSocket(socket);
    }, []);

    useEffect(() => {
        const fetchSolves = async () => {
            try {
                const userSolvesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-user-solves`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                const userSolveData = await userSolvesRes.json();

                if (!userSolveData.ok) {
                    console.log(userSolveData.message);
                    return null;
                }

                setSolveData(userSolveData.data);
            } catch (error) {
                console.error('Error fetching solves:', error);
            }
        };

        fetchSolves();
    }, [user?.userId]);

    const play = (e: React.FormEvent) => {
        e.preventDefault();

        if (!socket) return;

        socket.emit('player:initialize', user);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-w-[850px] h-full bg-gray-100 text-white gap-3">
            <div className="flex justify-center gap-3">
                {/* Account information */}
                <div className="flex flex-col w-[250px] h-[500px] p-4 gap-1 rounded-[10px] shadow-lg bg-gray-200">
                    <div className="flex items-center gap-[10px] p-3">
                        <Image src="/user.svg" height={30} width={30} priority={true} alt="user icon" />
                        <div>{user?.username || 'Guest'}</div>
                    </div>

                    <div className="border-t-1 mb-3" />

                    {!user?.loggedIn ? (
                        <button
                            onClick={() => handleLogin()}
                            className="py-2 px-4 rounded-[5px] bg-gray-100 hover:bg-gray-50"
                        >
                            Login / Signup
                        </button>
                    ) : null}
                    <div className="items-center justify-center h-full flex gap-[10px]">
                        {!user?.loggedIn ? (
                            <div>Log in to view stats</div>
                        ) : (
                            <PlayerStats solveData={solveData} handleLogout={handleLogout} />
                        )}
                    </div>
                </div>

                {/* Main componenet */}
                <div className="flex flex-col w-[350px] h-[500px] rounded-[10px] shadow-lg justify-center items-center gap-3 bg-gray-200">
                    <div className="text-white font-bold font-inter text-3xl">Virtual Cube</div>
                    <div className="text-white font-inter text-s">Welcome, {user?.username}!</div>
                    <br />
                    <button
                        onClick={play}
                        className="w-[300px] py-2 px-4 rounded-lg mb-5 bg-purple-100 hover:bg-purple-50"
                    >
                        Play
                    </button>
                    <button className="w-[300px] py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-50">Leaderboard</button>
                    <button
                        // onClick={() => setShowInstructions(true)}
                        className="w-[300px] py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-50"
                    >
                        How to play
                    </button>
                </div>

                {/* Game mode select */}
                <div className="w-[250px]">
                    <div className="flex flex-col w-[200px] rounded-[10px] text-sm rounded shadow-lg p-3 gap-2 bg-gray-200">
                        <button
                            onClick={() => setGameMode('Unrated')}
                            className={`flex items-center px-2 py-1 rounded-[5px] gap-[10px]
                            ${gameMode === 'Unrated' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                        >
                            <Image src="/controller.svg" height={30} width={30} priority={true} alt="user icon" />
                            <div>Unrated</div>
                        </button>
                        <button
                            onClick={() => setGameMode('Singleplayer')}
                            className={`flex items-center px-2 py-1 rounded-[5px] gap-[10px]
                            ${gameMode === 'Singleplayer' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                        >
                            <Image src="/clock.svg" height={30} width={30} priority={true} alt="user icon" />
                            <div>Coming soon...</div>
                        </button>
                        <button
                            onClick={() => setGameMode('Ranked')}
                            className={`flex items-center px-3 py-2 rounded-[5px] gap-[15px]
                            ${gameMode === 'Ranked' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                        >
                            <Image src="/swords.svg" height={20} width={20} priority={true} alt="user icon" />
                            <div>Coming soon...</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
