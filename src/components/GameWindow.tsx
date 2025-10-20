'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Cube } from '@/components/three/cube';
import Scene from '@/components/three/scene';
import { Player } from '@/types/player';
import { Notation, KeybindMap, notationFromString } from '@/types/cubeTypes';

// FIXME: Put that somewhere else
// prettier-ignore
// Stop removing the quotes on the keys
const default_keybinds: KeybindMap = {
    'f': Notation.U_PRIME, // turns
    'j': Notation.U,
    's': Notation.D,
    'l': Notation.D_PRIME,
    'i': Notation.R,
    'k': Notation.R_PRIME,
    'd': Notation.L,
    'e': Notation.L_PRIME,
    'h': Notation.F,
    'g': Notation.F_PRIME,
    'w': Notation.B,
    'o': Notation.B_PRIME,
    'x': Notation.M_PRIME,
    '.': Notation.M_PRIME,
    '6': Notation.M,
    '0': Notation.S,
    '1': Notation.S_PRIME,
    '2': Notation.E,
    '9': Notation.E_PRIME,
    ';': Notation.y, // rotations
    'a': Notation.y_PRIME,
    'y': Notation.x,
    'b': Notation.x_PRIME,
    'p': Notation.z,
    'q': Notation.z_PRIME,
};

const scrambleBuffer: Record<string, string> = {};

export default function GameWindow() {
    const [players, setPlayers] = useState<Player[]>([]);
    const socket = getSocket();

    useEffect(() => {
        const socket = getSocket();

        socket.on('game:start', (users: Player[], scramble: string) => {
            console.log(`Starting game with ${users.length} players: `, ...users);
            for (const user of users) {
                scrambleBuffer[user.socketId] = scramble;
            }
            const ordered = [
                ...users.filter((u) => u.socketId !== socket.id), // opponents first
                ...users.filter((u) => u.socketId === socket.id), // me last
            ];

            setPlayers(ordered);
        });
    }, [socket]);

    useEffect(() => {
        for (let i = 0; i < players.length; i++) {
            const userID = players[i].socketId;
            const element = document.getElementById(userID);
            if (element) {
                newScene(element, userID);
            }
        }

        // NOTE: assignedSocketID is the socket id of the player associated to this scene
        // (1 scene per player)
        function newScene(container: HTMLElement, assignedSocketID: string) {
            const { scene, renderer, camera, webgl_cleanup } = Scene(container);
            console.log('INITIALIZING NEW SCENE');

            const scramble = scrambleBuffer[assignedSocketID];
            const cube = new Cube(scene, renderer, camera, scramble);
            delete scrambleBuffer[assignedSocketID];

            if (!socket) {
                console.log('socket not found');
                return;
            }

            const emitter = socket.id == assignedSocketID;

            // Make sure we capture keydowns only if the scene is the active player's scene
            //     Since there is 2 scenes, one for each cube, if we add 2 event listener,
            //     the check for is cube solved will check for the opponent's cube and thus send the event
            // I would have loved to put that call elsewhere, but we need the socket and the cube
            if (emitter) {
                window.addEventListener('keydown', async (e) => {
                    // This fixes an issue that would allow a player to continue moving its cube on the other player's screen after solving it
                    if (await cube.isSolved()) {
                        return;
                    }

                    const maybe_move: Notation | null = default_keybinds[e.key];

                    if (maybe_move == null) {
                        console.log(`Key not in the bindmap: ${e.key}`);
                        return;
                    }

                    const move = maybe_move!;

                    cube.handleInput(move);

                    console.log(`Sending move: ${move}`);

                    socket.emit('keyboard:input', socket.id, move);

                    if (await cube.isSolved()) {
                        socket.emit('player:completed_solve', socket.id);
                        // FIXME: Maybe remove the keydown event listener here ?
                    }
                });
            }

            socket.on('keyboard:input', async (socketID: string, key: string) => {
                if (socketID == socket.id || socketID != assignedSocketID) {
                    // Local player moves are handled in the keydown callback
                    return;
                }

                const maybe_notation: Notation | null = notationFromString(key);

                if (maybe_notation == null) {
                    console.log(
                        `Received an 'keyboard:input' event but the data could not be parsed to a cube Notation: ${key}`
                    );
                    return;
                }

                const notation = maybe_notation!;

                cube.handleInput(notation);
            });

            socket.on('room:found', async () => {
                // console.log("Webgl scene cleanup");
                webgl_cleanup();
            });
        }
    }, [players, socket]);

    return (
        <div className="flex justify-center w-full h-full gap-5">
            {players.map(
                (user: Player) =>
                    user && (
                        <div
                            id={user.socketId}
                            key={user.socketId}
                            className={`w-full h-full ${user.socketId !== socket.id ? 'opacity-50' : ''}`}
                        />
                    )
            )}
        </div>
    );
}
