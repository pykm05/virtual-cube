'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { getSocket, Socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import AccountInfoCard from '@/components/menu/AccountInfo/AccountInfoCard';
import MainMenuCard from '@/components/menu/MainMenu/MainMenuCard';
import GameModeCard from '@/components/menu/GameMode/GameModeCard';
import { useAuth } from '@/context/AuthContext';

type SolveData = {
    scramble: string;
    solve_duration: number;
    solved_at: string;
};

export default function PlayHome() {
    const [gameMode, setGameMode] = useState<'Unrated' | 'Singleplayer' | 'Ranked'>('Unrated');
    const [solveData, setSolveData] = useState<SolveData[]>([]);
    const [socket, setSocket] = useState<Socket>();

    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = async () => {
        router.push('/login');

        await logout();
    };

    const handleTutorial = () => {
        router.push('/tutorial');
    };

    const handleLeaderboard = () => {
        router.push('/leaderboard');
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
                    return null;
                }

                setSolveData(userSolveData.data);
            } catch (error) {
                console.error('Error fetching solves:', error);
            }
        };
        fetchSolves();
    }, [user]);

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
            <div className="flex justify-center gap-3 p-3">
                <AccountInfoCard
                    user={user}
                    solveData={solveData}
                    handleLogin={handleLogin}
                    handleLogout={handleLogout}
                />
                <MainMenuCard
                    username={user.username}
                    onPlay={play}
                    onLeaderboard={handleLeaderboard}
                    onTutorial={handleTutorial}
                />
                <GameModeCard gameMode={gameMode} setGameMode={setGameMode} />
            </div>
        </div>
    );
}
