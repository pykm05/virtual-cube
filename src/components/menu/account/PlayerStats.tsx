type SolveData = {
    scramble: string;
    solve_duration: number;
    solved_at: string;
};

type PlayerStatsProps = {
    solveData: SolveData[];
    handleLogout: Function;
};

export default function PlayerStats({ solveData, handleLogout }: PlayerStatsProps) {
    // Standard ao5 cubing calculation
    const getAverage = (numSolves: number, i: number) => {
        if (i < numSolves - 1) return '-'; // need at least 5 solves (0-based index)

        const window = solveData.slice(i - numSolves + 1, i + 1); // last 5 solves ending at i
        const durations = window.map((s) => s.solve_duration);

        const min = Math.min(...durations);
        const max = Math.max(...durations);

        // remove one min and one max
        let filtered: number[] = [];
        let minRemoved = false;
        let maxRemoved = false;

        for (const d of durations) {
            if (d === min && !minRemoved) {
                minRemoved = true;
                continue;
            }
            if (d === max && !maxRemoved) {
                maxRemoved = true;
                continue;
            }
            filtered.push(d);
        }

        const avg = filtered.reduce((acc, cur) => acc + cur, 0) / filtered.length;

        return (Math.ceil(avg * 100) / 100).toFixed(2);
    };

    // show last 5 solves from newest to oldest
    const lastFiveSolves: SolveData[] = solveData;

    return (
        <div className="flex flex-col h-full w-full items-center gap-3">
            <div className="w-full h-[100px] overflow-y-auto rounded-lg">
                <table className="text-center w-full h-[30px] text-sm rounded-lg overflow-scroll">
                    <thead>
                        <tr>
                            <th className="px-1">#</th>
                            <th className="px-1">time</th>
                            <th className="px-1">ao5</th>
                            <th className="px-1">ao12</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solveData.length > 0 ? (
                            solveData.map((solve, i) => {
                                const originalIndex = solveData.length - (i + 1);
                                return (
                                    <tr
                                        key={originalIndex}
                                        className="odd:bg-gray-200 even:bg-gray-100 overflow-hidden"
                                    >
                                        <td className="px-1 py-1">{originalIndex + 1}</td>
                                        <td className="px-1 py-1">{solve.solve_duration.toFixed(2)}</td>
                                        <td className="px-1 py-1">{getAverage(5, originalIndex)}</td>
                                        <td className="px-1 py-1">{getAverage(12, originalIndex)}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="h-[75px]">
                                    No solves yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button
                onClick={() => handleLogout()}
                className="w-full py-2 px-4 rounded-[5px] bg-gray-100 hover:bg-gray-50"
            >
                Logout
            </button>
        </div>
    );
}
