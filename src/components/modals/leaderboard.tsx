'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';

type Leaderboard = Database['public']['Tables']['leaderboard']['Row'];

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser?: string;
}

function getRelativeTime(timestamp: string) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return `${diffWeek}w ago`;
}

async function getLeaderboard(): Promise<Leaderboard[] | null> {
    try {
        const response = await fetch(`http://localhost:4000/api/leaderboard/10`);

        if (!response.ok) {
            console.log(`Unexpected http code: ${response.status}`);
            return null;
        }

        const lb: Leaderboard[] = await response.json();
        return lb;
    } catch (error) {
        console.error('Error fetching leaderboard: ${error}');
        return null;
    }
}

export default function LeaderboardModal({ isOpen, onClose, currentUser }: LeaderboardModalProps) {
    const [entries, setEntries] = useState<Leaderboard[]>([]);

    useEffect(() => {
        if (isOpen) {
            let c = async () => {
                const data = (await getLeaderboard()) ?? [];
                // console.log(`got leaderboard: ${JSON.stringify(data)}`);
                setEntries(data);
            };

            c(); // You really can't call an anon closure ? :c
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getRankIcon = (index: number) => {
        const icons = ['🥇', '🥈', '🥉'];
        return icons[index] || `${index + 1}`;
    };

    return (
        <div className="fixed inset-0 z-50 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="absolute inset-x-0 bottom-0 h-[75vh] md:relative md:inset-auto md:flex md:items-center md:justify-center md:min-h-full md:p-4 md:h-auto">
                <div className="w-full h-full md:w-[40rem] md:h-auto md:max-h-[50vh] bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-2xl border border-gray-700/40 rounded-t-2xl md:rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden">
                    {/* Drag handle (mobile) */}
                    <div className="md:hidden flex justify-center pt-3 pb-2 flex-shrink-0">
                        <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700/30 to-blue-800/30 border-b border-gray-700">
                        <h3 className="text-2xl font-bold text-white tracking-tight">🏆 Leaderboard</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-700/40 rounded-lg transition"
                            aria-label="Close leaderboard"
                        >
                            <X className="w-5 h-5 text-gray-300 hover:text-white" />
                        </button>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                        <table className="w-full text-left text-sm md:text-base text-gray-200">
                            <thead className="sticky top-0 bg-gray-900/90 backdrop-blur-sm text-gray-400 text-xs uppercase z-10 shadow-md">
                                <tr>
                                    <th className="py-2 px-2">#</th>
                                    <th className="py-2 px-2">Username</th>
                                    <th className="py-2 px-2">Time (s)</th>
                                    <th className="py-2 px-2">Solved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...entries]
                                    .sort((a, b) => a.solve_duration - b.solve_duration)
                                    .map((entry, index) => {
                                        const highlight = currentUser && entry.username === currentUser;
                                        return (
                                            <tr
                                                key={index}
                                                className={`border-b border-gray-700/30 transition hover:bg-gray-700/20 ${
                                                    highlight ? 'bg-blue-900/40 font-bold' : ''
                                                }`}
                                            >
                                                <td className="py-2 px-2">{getRankIcon(index)}</td>
                                                <td className="py-2 px-2 truncate max-w-[8rem]">{entry.username}</td>
                                                <td className="py-2 px-2">{entry.solve_duration.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-xs text-gray-400">
                                                    {getRelativeTime(entry.solved_at)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                        {entries.length === 0 && <p className="text-center text-gray-400 pt-6">No entries yet.</p>}
                    </div>
                </div>
            </div>

            {/* Hide Scrollbar */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
