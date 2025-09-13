'use client';
import { X, User, Trophy, Clock, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Database } from '@/types/supabase';

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/10`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: null,
            credentials: 'include',
        });

        let data = await response.json();

        if (!response.ok) {
            const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: null,
                credentials: 'include',
            });

            const refreshData = await refreshRes.json();

            if (!refreshRes.ok) {
                console.log(refreshData.message);
                return null;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/10`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: null,
                credentials: 'include',
            });

            data = await response.json();
        }

        const lb: Leaderboard[] = data.data;
        return lb;
    } catch (error) {
        console.error('Error fetching leaderboard: ${error}');
        return null;
    }
}

function UserSideModal({ user, entries, onClose }: { user: Leaderboard; entries: Leaderboard[]; onClose: () => void }) {
    const sorted = [...entries].sort((a, b) => a.solve_duration - b.solve_duration);
    const rank = sorted.findIndex((e) => e.username === user.username && e.solved_at === user.solved_at) + 1;

    return (
        <div className="fixed right-0 top-0 h-full w-100 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl z-60 animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    User Details
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-700/40 rounded-lg transition"
                    aria-label="Close user details"
                >
                    <X className="w-5 h-5 text-gray-300 hover:text-white" />
                </button>
            </div>

            {/* User Info */}
            <div className="p-6 space-y-6">
                {/* Avatar and Name */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white">{user.username}</h4>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <div>
                            <p className="text-sm text-gray-400">Rank</p>
                            <p className="text-lg font-semibold text-white">#{rank}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-gray-400">Solve Time</p>
                            <p className="text-lg font-semibold text-white">{user.solve_duration.toFixed(2)}s</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-400">Solved</p>
                            <p className="text-lg font-semibold text-white">{getRelativeTime(user.solved_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-white uppercase tracking-wide">Scramble</h5>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                        <p className="text-sm text-gray-300 font-mono leading-relaxed">{user.scramble}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-white uppercase tracking-wide">Solution</h5>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                        <p className="text-sm text-gray-300 font-mono leading-relaxed">{user.move_list}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LeaderboardModal({ isOpen, onClose, currentUser }: LeaderboardModalProps) {
    const [entries, setEntries] = useState<Leaderboard[]>([]);
    const [selectedUser, setSelectedUser] = useState<Leaderboard | null>(null);

    useEffect(() => {
        if (isOpen) {
            const c = async () => {
                const data = (await getLeaderboard()) ?? [];
                setEntries(data);
            };

            c();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectedUser) {
                const target = event.target as Element;
                // Don't close if clicking on the side modal itself
                if (!target.closest('.side-modal') && !target.closest('tr[data-user-row]')) {
                    setSelectedUser(null);
                }
            }
        };

        if (selectedUser) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [selectedUser]);

    const handleUserClick = (user: Leaderboard) => {
        setSelectedUser(user);
    };

    if (!isOpen) return null;

    const getRankIcon = (index: number) => {
        const icons = ['🥇', '🥈', '🥉'];
        return icons[index] || `${index + 1}`;
    };

    const sortedEntries = [...entries].sort((a, b) => a.solve_duration - b.solve_duration);

    return (
        <div className="fixed inset-0 z-50 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Main Modal */}
            <div className="absolute inset-x-0 bottom-0 h-[75vh] md:relative md:inset-auto md:flex md:items-center md:justify-center md:min-h-full md:p-4 md:h-auto">
                <div
                    className={`w-full h-full md:w-[40rem] md:h-auto md:max-h-[50vh] bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-2xl border border-gray-700/40 rounded-t-2xl md:rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden transition-all duration-300 ${selectedUser ? 'md:mr-80' : ''}`}
                >
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
                                {sortedEntries.map((entry, index) => {
                                    const highlight = currentUser && entry.username === currentUser;
                                    const isSelected = selectedUser === entry;
                                    return (
                                        <tr
                                            key={`${entry.username}-${entry.solved_at}-${index}`}
                                            data-user-row
                                            className={`border-b border-gray-700/30 transition hover:bg-gray-700/20 cursor-pointer ${
                                                highlight ? 'bg-blue-900/40 font-bold' : ''
                                            } ${isSelected ? 'bg-purple-900/30' : ''}`}
                                            onClick={() => handleUserClick(entry)}
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
                        {entries.length === 0 && (
                            <p className="text-center text-gray-400 pt-6">Log in to view entries</p>
                        )}
                    </div>
                </div>
            </div>

            {selectedUser && (
                <div className="side-modal">
                    <UserSideModal user={selectedUser} entries={entries} onClose={() => setSelectedUser(null)} />
                </div>
            )}

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

                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
