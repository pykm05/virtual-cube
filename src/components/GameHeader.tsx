'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { PlayerState } from '@/types/player';

function textForState(state: PlayerState): string {
    switch (state) {
        case PlayerState.DISCONNECTED:
            console.log('[ERROR] Current player left for some reason');
            return 'Impossible state';
        case PlayerState.NOT_YET_STARTED:
            return 'Awaiting players. . .';
        case PlayerState.INSPECTION:
            return 'Cube inspection';
        case PlayerState.SOLVING:
            return 'Solve in progress';
        case PlayerState.SOLVED:
            return 'Waiting for opponent';
        case PlayerState.DNF:
            return 'Game complete';
    }
}

export default function Game() {
    const [localState, setLocalState] = useState(PlayerState.NOT_YET_STARTED);
    const [time, setTime] = useState(15);

    useEffect(() => {
        const socket = getSocket();

        socket.on('player:state_update', (id: string, state: PlayerState) => {
            if (id != socket.id) return;
            setLocalState(state);
        });

        socket.on('timer:update', (t) => {
            setTime(t);
        });
    }, []);

    return (
        <div className="z-50 absolute m-auto left-0 right-0 p-5 flex flex-col justify-center items-center h-[100px] w-[350px] rounded-b-lg bg-purple-100 font-bold text-2xl">
            <div>{textForState(localState)}</div>
            <div>{localState == PlayerState.INSPECTION || localState == PlayerState.SOLVING ? time : null}</div>
        </div>
    );
}
