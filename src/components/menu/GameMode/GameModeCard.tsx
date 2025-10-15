import Image from 'next/image';

type GameMode = 'Unrated' | 'Singleplayer' | 'Ranked';

type GameModeCardProps = {
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
};

export default function GameModeCard({
    gameMode,
    setGameMode
}: GameModeCardProps) {
    return (
        <div className="w-[250px]">
            <div className="flex flex-col w-[200px] rounded-[10px] text-sm rounded shadow-lg p-3 gap-2 bg-gray-200">
                <button
                    onClick={() => setGameMode('Unrated')}
                    className={`flex items-center px-2 py-1 rounded gap-[10px]
                    ${gameMode === 'Unrated' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                >
                    <Image
                        src="/controller.svg"
                        height={30}
                        width={30}
                        priority={true}
                        alt="controller icon"
                    />
                    <div>Unrated</div>
                </button>

                <button
                    onClick={() => setGameMode('Singleplayer')}
                    className={`flex items-center px-2 py-1 rounded gap-[10px]
                    ${gameMode === 'Singleplayer' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                >
                    <Image
                        src="/clock.svg"
                        height={30}
                        width={30}
                        priority={true}
                        alt="clock icon"
                    />
                    <div>Coming soon...</div>
                </button>

                <button
                    onClick={() => setGameMode('Ranked')}
                    className={`flex items-center px-3 py-2 rounded gap-[15px]
                    ${gameMode === 'Ranked' ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                >
                    <Image
                        src="/swords.svg"
                        height={20}
                        width={20}
                        priority={true}
                        alt="swords icon"
                    />
                    <div>Coming soon...</div>
                </button>
            </div>
        </div>
    );
}
