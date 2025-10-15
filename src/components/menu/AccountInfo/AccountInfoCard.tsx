import { useMemo } from 'react';
import Image from 'next/image';
import EChart from './EChart';

type SolveData = {
    scramble: string;
    solve_duration: number;
    solved_at: string;
};

type PlayerStatsProps = {
    user: any;
    solveData: SolveData[];
    handleLogout: () => void;
    handleLogin: () => void;
};

const getAverage = (solveData: SolveData[], numSolves: number, i: number): number | null => {
    if (i < numSolves - 1) return null;

    const window = solveData.slice(i - numSolves + 1, i + 1);
    const durations = window.map((s) => s.solve_duration);

    const min = Math.min(...durations);
    const max = Math.max(...durations);

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
    return Math.round(avg * 100) / 100;
};

export default function AccountInfoCard({
    user,
    solveData,
    handleLogout,
    handleLogin,
}: PlayerStatsProps) {
    const tableData = useMemo(() => {
        return solveData.map((solve, i) => ({
            originalIndex: i,
            solve,
            ao5: getAverage(solveData, 5, i),
            ao12: getAverage(solveData, 12, i),
        }));
    }, [solveData]);

    const bestIndices = useMemo(() => {
        if (tableData.length === 0) return { single: null, ao5: null, ao12: null };

        let bestSingleIdx: number | null = null;
        let bestAo5Idx: number | null = null;
        let bestAo12Idx: number | null = null;

        tableData.forEach(({ solve, ao5, ao12 }, idx) => {
            if (bestSingleIdx === null || solve.solve_duration < tableData[bestSingleIdx].solve.solve_duration) {
                bestSingleIdx = idx;
            }
            if (ao5 !== null && (bestAo5Idx === null || ao5 < tableData[bestAo5Idx].ao5!)) {
                bestAo5Idx = idx;
            }
            if (ao12 !== null && (bestAo12Idx === null || ao12 < tableData[bestAo12Idx].ao12!)) {
                bestAo12Idx = idx;
            }
        });

        return { single: bestSingleIdx, ao5: bestAo5Idx, ao12: bestAo12Idx };
    }, [tableData]);

    return (
        <div className="flex flex-col w-[250px] h-[500px] p-4 gap-1 rounded-lg shadow-lg bg-gray-200">
            <div className="flex items-center gap-2.5 p-3">
                <Image src="/user.svg" height={30} width={30} priority alt="user icon" />
                <div>{user?.username || 'Guest'}</div>
            </div>

            <div className="border-t mb-3" />

            {!user?.loggedIn ? (
                <button
                    onClick={handleLogin}
                    className="py-2 px-4 rounded bg-gray-100 hover:bg-gray-50"
                >
                    Login / Signup
                </button>
            ) : null}

            <div className="flex items-center justify-center h-full gap-2.5">
                {!user?.loggedIn ? (
                    <div>Log in to view stats</div>
                ) : (
                    <div className="flex flex-col h-full w-full items-center">
                        <div className="flex justify-between border border-gray-100 mb-5 rounded-lg py-2 px-4 text-sm text-white">
                            <div className="flex-1 text-center">
                                <span className="font-semibold">Best Single:</span>
                                <div className={`${bestIndices.single !== null ? 'text-blue-100' : ''} font-semibold`}>
                                    {bestIndices.single !== null ? tableData[bestIndices.single].solve.solve_duration.toFixed(2) : 'NA'}
                                </div>
                            </div>
                            <div className="flex-1 text-center">
                                <span className="font-semibold">Best Ao5:</span>
                                <div className={`${bestIndices.ao5 !== null ? 'text-yellow-100' : ''} font-semibold`}>
                                    {bestIndices.ao5 !== null ? tableData[bestIndices.ao5].ao5!.toFixed(2) : 'NA'}
                                </div>
                            </div>
                            <div className="flex-1 text-center">
                                <span className="font-semibold">Best Ao12:</span>
                                <div className={`${bestIndices.ao12 !== null ? 'text-green-100' : ''} font-semibold`}>
                                    {bestIndices.ao12 !== null ? tableData[bestIndices.ao12].ao12!.toFixed(2) : 'NA'}
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-[100px] overflow-y-auto mb-5 rounded-lg">
                            <table className="text-center w-full text-sm rounded-lg">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 px-1 bg-gray-200">#</th>
                                        <th className="sticky top-0 px-1 bg-gray-200">time</th>
                                        <th className="sticky top-0 px-1 bg-gray-200">ao5</th>
                                        <th className="sticky top-0 px-1 bg-gray-200">ao12</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length > 0 ? (
                                        tableData.toReversed().map(({ originalIndex, solve, ao5, ao12 }, displayIdx) => {
                                            const idx = tableData.length - 1 - displayIdx;
                                            return (
                                                <tr
                                                    key={originalIndex}
                                                    className="odd:bg-gray-200 even:bg-gray-100 overflow-hidden"
                                                >
                                                    <td className="px-1 py-1">{originalIndex + 1}</td>
                                                    <td className={`px-1 py-1 ${bestIndices.single === idx ? 'text-blue-100 font-semibold' : ''}`}>
                                                        {solve.solve_duration.toFixed(2)}
                                                    </td>
                                                    <td className={`px-1 py-1 ${bestIndices.ao5 === idx ? 'text-yellow-100 font-semibold' : ''}`}>
                                                        {ao5 !== null ? ao5.toFixed(2) : 'NA'}
                                                    </td>
                                                    <td className={`px-1 py-1 ${bestIndices.ao12 === idx ? 'text-green-100 font-semibold' : ''}`}>
                                                        {ao12 !== null ? ao12.toFixed(2) : 'NA'}
                                                    </td>
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

                        <div className="flex justify-center h-30 w-full bg-white rounded-lg shadow mb-5 p-1 [&_*]:outline-none">
                            <EChart solveData={solveData} />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full py-2 px-4 rounded bg-gray-100 hover:bg-gray-50"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
