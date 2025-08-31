'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { PlayerState } from '@/types/player';

// enum RoomState {
//     GAME_NOT_STARTED = 'Awaiting players...',
//     INSPECTION_TIME = 'Cube inspection',
//     SOLVE_IN_PROGRESS = 'Solve in progress',
//     GAME_ENDED = 'Game complete',
// }

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
    // const [oppState, setOppState] = useState(PlayerState.NOT_YET_STARTED);

    const [time, setTime] = useState(15);

    useEffect(() => {
        const socket = getSocket();

        socket.on('timer:update', (t) => {
            setTime(t);
        });

        socket.on('player:state_update', (id: string, state: PlayerState) => {
            if (id != socket.id) {
                // opp
                return;
            }
            setLocalState(state);

            // if (id == socket.id) {
            //     console.log(`Local player state changed from ${localState} to ${state}`);
            //     setLocalState(state);
            // }else{
            //     console.log(`Opp player state changed from ${oppState} to ${state}`);
            //     setOppState(state);
            // }
        });
    }, []);

    return (
        <div className="flex flex-col items-center w-full p-5 bg-purple-800 text-white">
            <div>{textForState(localState)}</div>
            <div>{localState == PlayerState.INSPECTION || localState == PlayerState.SOLVING ? time : null}</div>
        </div>
    );
}
