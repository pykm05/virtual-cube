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
        const opponent = socket.id == playerRanks[0].socketId ? playerRanks[1] : playerRanks[0];

        const oppDNF = opponent.state == PlayerState.DNF;
        const won = oppDNF || opponent.socketId == playerRanks[1].socketId;

        return (
            <div className="flex flex-col w-[350px] h-[400px] bg-gray-200 rounded-lg text-white">
                <div className="relative flex text-lg justify-center items-center px-3 py-5">
                    <button
                        onClick={returnToMenu}
                        className="absolute top-2 left-2 flex items-center px-1 rounded-full bg-gray-100 hover:bg-gray-50"
                    >
                        X
                    </button>

                    <div className="font-bold text-2xl ">{tied ? 'Tie' : won ? 'You won!' : 'You lost'}</div>
                </div>

                {!tied && (
                    <div className="flex">
                        <div className="flex flex-1 justify-center">
                            {!oppDNF && !won && (
                                <Image src="/crown.svg" height={40} width={40} priority={true} alt="user icon" />
                            )}
                        </div>
                        <div className="flex flex-1 justify-center">
                            {won && <Image src="/crown.svg" height={40} width={40} priority={true} alt="user icon" />}
                        </div>
                    </div>
                )}
                <div className="flex h-[300px] items-center">
                    <div className="flex flex-1 flex-col items-center">
                        <Image src="/user.svg" height={50} width={50} priority={true} alt="user icon" />
                        <div className="mt-[10px]">{opponent.username}</div>
                        <div>{oppDNF ? 'DNF' : opponent.solveTime}</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center">
                        <Image src="/user.svg" height={50} width={50} priority={true} alt="user icon" />
                        <div className="mt-[10px]">{player.username}</div>
                        <div>{player.state == PlayerState.DNF ? 'DNF' : player.solveTime}</div>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-[20px] px-3 py-3">
                    <button
                        onClick={joinNewGame}
                        className="w-[175px] py-3 px-5 rounded-lg bg-gray-100 hover:bg-gray-50"
                    >
                        New Game
                    </button>
                    <button
                        onClick={handleRematch}
                        className="w-[175px] py-3 px-5 rounded-lg bg-gray-100 hover:bg-gray-50"
                    >
                        {rematchMessage != '' ? (
                            rematchMessage == 'Awaiting player response...' ? (
                                <>cancel</>
                            ) : (
                                <div>
                                    Rematch ({rematchInfo.queueSize}/{rematchInfo.playerCount})
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
            const p = rankings.find((p) => p.socketId == socket.id);

            console.log('game end');

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

    return gameComplete || cubeSolved ? (
        <div className="z-100 fixed inset-0 bg-black/50 w-full h-full p-3 flex justify-center items-center">
            <div className="flex justify-center items-center">{displayResults()}</div>
        </div>
    ) : null;
}
