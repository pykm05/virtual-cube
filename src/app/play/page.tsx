'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import InstructionsModal from '@/components/modals/instruction';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getSocket, Socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

export default function PlayHome() {
    const [name, setName] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />
            <button
                onClick={() => setShowInstructions(true)}
                className="absolute top-6 right-6 p-2 bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-lg hover:bg-gray-700/60 transition-all duration-200 z-20"
                aria-label="How to play"
            >
                <Info className="w-5 h-5 text-gray-300 hover:text-white" />
            </button>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-white">Virtual Cube</h1>
                        <p className="text-gray-300 text-lg font-medium">Compete. Solve. Conquer.</p>
                    </div>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-xl border border-red-800/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-black/30 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>

                    <div className="absolute top-2 left-2 w-2 h-2 bg-red-500/30 rounded-sm"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500/30 rounded-sm"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-500/30 rounded-sm"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-500/30 rounded-sm"></div>

                    <div className="text-center space-y-2 relative z-10">
                        <h2 className="text-2xl font-semibold text-gray-100">Enter Your Name</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label htmlFor="player-name" className="block text-sm font-medium text-gray-200">
                                Player Name
                            </label>
                            <input
                                id="player-name"
                                type="text"
                                placeholder="an unnamed cuber"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-3 bg-gray-700/50 border border-gray-500/50 rounded-md text-gray-100 placeholder:text-gray-400 focus:outline-none h-12 text-lg backdrop-blur-sm transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-gray-100 font-medium h-10 text-base rounded-lg transition-all duration-200 shadow-lg shadow-slate-700/20 hover:shadow-slate-600/30 hover:scale-[1.01] active:scale-[0.99] border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                        >
                            Continue to Game
                        </button>
                    </form>

                    <div className="border-t border-gray-600/30 pt-6 relative z-10">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-green-400">1,247</div>
                                <div className="text-xs text-gray-400 font-medium">Players Online</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-red-400">89,432</div>
                                <div className="text-xs text-gray-400 font-medium">Cubes Solved</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-blue-400">156</div>
                                <div className="text-xs text-gray-400 font-medium">Active Games</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
        </div>
    );
}
