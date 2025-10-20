'use client';

import React from 'react';

type MainMenuCardProps = {
    username?: string;
    onPlay: (e: React.FormEvent) => void;
    onLeaderboard?: () => void;
    onTutorial?: () => void;
};

export default function MainMenuCard({ username = 'Guest', onPlay, onLeaderboard, onTutorial }: MainMenuCardProps) {
    return (
        <div className="flex flex-col w-[350px] h-[500px] rounded-2xl shadow-lg justify-center items-center gap-4 bg-gray-200">
            <div className="text-white font-bold text-3xl font-inter">Virtual Cube</div>
            <div className="text-white text-sm font-inter">Welcome, {username}!</div>

            <div className="flex flex-col gap-3 mt-4">
                <button
                    onClick={onPlay}
                    className="w-[300px] py-2 px-4 rounded-lg mb-2 bg-purple-100 hover:bg-purple-50 transition"
                >
                    Play
                </button>

                <button
                    onClick={onLeaderboard}
                    className="w-[300px] py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-50 transition"
                >
                    Leaderboard
                </button>

                <button
                    onClick={onTutorial}
                    className="w-[300px] py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-50 transition"
                >
                    Tutorial
                </button>
            </div>
        </div>
    );
}
