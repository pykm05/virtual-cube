import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
    const [single, setSingle] = useState<string>('NA');
    const [ao5, setAo5] = useState<string>('NA');
    const [ao12, setAo12] = useState<string>('NA');

    // Standard cubing average calculation
    const getAverage = (numSolves: number, i: number) => {
        if (i < numSolves - 1) return '-'; // need at least numSolves # of solves

        const window = solveData.slice(i - numSolves + 1, i + 1); // last solves ending at i
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

    useEffect(() => {
        if (solveData.length === 0) {
            setAo5('NA');
            setAo12('NA');
            setSingle('NA');
            return;
        }

        let bestSingle = Infinity;
        let bestAo5 = Infinity;
        let bestAo12 = Infinity;

        for (let i = 0; i < solveData.length; i++) {
            const avg5 = parseFloat(getAverage(5, i));
            const avg12 = parseFloat(getAverage(12, i));

            if (solveData[i].solve_duration < bestSingle) bestSingle = solveData[i].solve_duration;
            if (!isNaN(avg5) && avg5 < bestAo5) bestAo5 = avg5;
            if (!isNaN(avg12) && avg12 < bestAo12) bestAo12 = avg12;
        }

        setSingle(bestSingle === Infinity ? 'NA' : bestSingle.toFixed(2));
        setAo5(bestAo5 === Infinity ? 'NA' : bestAo5.toFixed(2));
        setAo12(bestAo12 === Infinity ? 'NA' : bestAo12.toFixed(2));
    }, [, solveData]);

    return (
        <div className="flex flex-col h-full w-full gap-3 mb-3">
            <div className="text-sm">
                <div className="text-sm">best single: {single}</div>
                <div className="text-sm">best ao5: {ao5}</div>
                <div className="text-sm">best ao12: {ao12}</div>
            </div>
            <div className="w-full h-[100px] overflow-y-auto rounded-lg">
                <table className="text-center w-full h-[30px] text-sm rounded-lg overflow-scroll">
                    <thead>
                        <tr>
                            <th className="sticky top-0 px-1 bg-gray-200">#</th>
                            <th className="sticky top-0 px-1 bg-gray-200">time</th>
                            <th className="sticky top-0 px-1 bg-gray-200">ao5</th>
                            <th className="sticky top-0 px-1 bg-gray-200">ao12</th>
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
            <div className="h-30 bg-white rounded-lg shadow mb-3 p-1 w-[100%] outline-none [&_*]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={solveData.toReversed().map((s, i) => ({
                            index: i + 1,
                            time: s.solve_duration,
                        }))}
                    >
                        <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                        <Tooltip />
                        <Line
                            dataKey="time"
                            stroke="#3b82f6"
                            strokeWidth={1.5}
                            dot={false}
                            isAnimationActive={false} // 🚀 disables animation
                        />
                    </LineChart>
                </ResponsiveContainer>
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
