'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import GameWindow from '@/components/GameWindow';
import GameHeader from '@/components/GameHeader';
import GameModal from '@/components/GameModal';

export default function PlayerWindow() {
    const router = useRouter();

    useEffect(() => {
        const socket = getSocket();

        socket.emit('room:joined', window.location.pathname.split('/').pop() || '');

        socket.on('join:invalid', () => {
            router.push('../');
            socket.off('join:invalid');
        });
    }, []);

    return (
        <div className="flex flex-col w-screen h-screen">
            <GameHeader />
            <GameWindow />
            <GameModal />
        </div>
    );
}
