'use client';
import { useEffect, useState } from 'react';
import { getSocket, Socket } from '@/lib/socket';
import { Player, PlayerState } from '@/types/player';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type RematchInfo = {
    queueSize: number;
    playerCount: number;
};

const checkAllPlayersDNF = (players: Player[]) => {
    return players.every((player) => player.state == PlayerState.DNF);
};

export default function GameModal() {
    const [socket, setSocket] = useState<Socket>();
    const [player, setplayer] = useState<Player>();
    const [cubeSolved, setCubeSolved] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [playerRanks, setPlayerRanks] = useState<Player[]>([]);

    const [rematchMessage, setRematchMessage] = useState('');
    const [rematchInfo, setRematchInfo] = useState<RematchInfo>({
        queueSize: 0,
        playerCount: 0,
    });

    const router = useRouter();

    function joinNewGame() {
        if (!socket || !player) return;

        socket.emit('room:join_random');
    }

    function handleRematch() {
        if (!socket || !player) return;

        socket.emit('room:join_rematch');
    }

    function returnToMenu() {
        router.push(`../`);
    }

    function displayResults() {
        if (!player) return;
        if (!socket) return;

        // FIXME: This logic does not use PlayerState.DISCONNECTED
        const allPlayersDNF = checkAllPlayersDNF(playerRanks);
        const tied = allPlayersDNF || playerRanks[0].solveTime == playerRanks[1].solveTime;
        const opponent = socket.id == playerRanks[0].id ? playerRanks[1] : playerRanks[0];

        const oppDNF = opponent.state == PlayerState.DNF;
        const won = oppDNF || opponent.id == playerRanks[1].id;

        return (
            <div className="flex flex-col w-full h-full">
                <div className="relative flex text-lg mb-[20px] justify-center items-center px-3 py-5 border-b-2">
                    <button
                        onClick={returnToMenu}
                        className="absolute border-2 top-2 left-2 flex items-center px-1 rounded-full"
                    >
                        X
                    </button>

                    {/* Centered status text */}
                    <div>{tied ? 'Tie' : won ? 'You won!' : 'You lost'}</div>
                </div>

                {!tied && (
                    <div className="flex">
                        <div className="flex flex-1 justify-center">
                            {
                                // What ?
                                !oppDNF && !won && (
                                    <Image src="/crown.svg" height={40} width={40} priority={true} alt="user icon" />
                                )
                            }
                        </div>
                        <div className="flex flex-1 justify-center">
                            {won && <Image src="/crown.svg" height={40} width={40} priority={true} alt="user icon" />}
                        </div>
                    </div>
                )}
                <div className="flex mb-[40px] w-full h-full items-center">
                    <div className="flex flex-1 flex-col items-center">
                        <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
                        <div>{opponent.username}</div>
                        <div>{oppDNF ? 'DNF' : opponent.solveTime}</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center">
                        <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
                        <div>{player.username}</div>
                        <div>{player.state == PlayerState.DNF ? 'DNF' : player.solveTime}</div>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-[10px] px-3 py-3">
                    <button onClick={joinNewGame} className="hover:bg-gray-200 px-9 py-4 border-2 rounded-[10px]">
                        New Game
                    </button>
                    <button
                        onClick={handleRematch}
                        className="hover:bg-gray-200 px-3 py-4 border-2 min-w-[150px] rounded-[10px]"
                    >
                        {rematchMessage != '' ? (
                            rematchMessage == 'Awaiting player response...' ? (
                                <>cancel</>
                            ) : (
                                <div>
                                    Accept rematch ({rematchInfo.queueSize}/{rematchInfo.playerCount})
                                </div>
                            )
                        ) : (
                            <>Rematch</>
                        )}
                    </button>
                </div>
                <div className="flex justify-center items-center pb-2 min-h-[40px]">{rematchMessage}</div>
            </div>
        );
    }

    useEffect(() => {
        const socket = getSocket();
        setSocket(socket);

        socket.on('player:state_update', (id: string, state: PlayerState) => {
            if (state != PlayerState.SOLVED || socket.id != id) return;
            setCubeSolved(true);
        });

        socket.on('game:complete', (rankings: Player[]) => {
            const p = rankings.find((p) => p.id == socket.id);

            if (!p) {
                console.log('[ERROR] DID NOT FIND SELF IN RANKINGS');
                return;
            }

            setplayer(p);
            setGameComplete(true);
            setPlayerRanks(rankings);
        });

        socket.on('room:found', (roomID) => {
            console.log('Now joining room ', roomID);
            router.push(`/play/${roomID}`);
            socket.off('room:found');
        });

        socket.on('room:rematch_pending', (senderID: string, roomInfo: RematchInfo, isQueued) => {
            if (senderID == socket.id && isQueued) setRematchMessage('Awaiting player response...');
            else if (roomInfo.queueSize > 0) setRematchMessage('Rematch request received');
            else setRematchMessage('');

            setRematchInfo(roomInfo);
        });
    }, []);

    return cubeSolved ? (
        <div className="fixed inset-0 z-50 bg-black/50 w-full h-full p-3 flex justify-center items-center">
            <div className="flex justify-center items-center rounded-[20px] w-[400px] bg-white">
                {gameComplete ? displayResults() : <div>Awaiting players to finish...</div>}
            </div>
        </div>
    ) : null;
}
