'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import GameWindow from '@/components/GameWindow';
import GameHeader from '@/components/GameHeader';
import GameModal from '@/components/GameModal';
import { PlayerState } from '@/types/player';

function QueueScreen() {
    return (
        <div className={`absolute flex flex-col items-center justify-center w-full h-full gap-5 text-white`}>
            <div>Finding match...</div>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
}

export default function PlayerWindow() {
    const [queueing, setQueueing] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const socket = getSocket();

        socket.emit('room:joined', window.location.pathname.split('/').pop() || '');

        socket.on('player:state_update', (id: string, state: PlayerState) => {
            if (id != socket.id) return;
            if (state === PlayerState.INSPECTION) setQueueing(false);
        });

        socket.on('join:invalid', () => {
            router.push('../../');
        });
    }, [router]);

    return (
        <div className="relative w-screen h-screen">
            {queueing && <QueueScreen />}
            <div className={`${queueing ? 'opacity-0' : 'opacity-100'} flex flex-col w-full h-full`}>
                <GameHeader />
                <GameWindow />
                <GameModal />
            </div>
        </div>
    );
}
