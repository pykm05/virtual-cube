import ReactECharts from 'echarts-for-react';

export default function EChart({ solveData }: { solveData: any[] }) {
    const values = solveData.map((d) => Number(d.solve_duration));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const options = {
        backgroundColor: 'white',
        animation: false,
        grid: { left: 15, right: 10, top: 10, bottom: 15 },
        xAxis: {
            type: 'category',
            data: solveData.map((_, i) => i + 1),
            axisLine: { lineStyle: { color: '#ccc' } },
            axisLabel: { color: '#666', fontSize: 9, margin: 4 },
            splitLine: { show: false },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'value',
            min: Math.floor(minValue * 0.9),
            max: Math.ceil(maxValue * 1.1),
            axisLine: { show: false },
            axisLabel: { color: '#666', fontSize: 9, margin: 2 },
            splitLine: { lineStyle: { color: '#eee' } },
            scale: false,
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                const p = params[0];
                return `Solve #${p.axisValue}<br/>Time: ${p.data.toFixed(2)}`;
            },
        },
        series: [
            {
                data: values,
                type: 'line',
                smooth: false,
                showSymbol: solveData.length === 1,
                lineStyle: { color: '#3b82f6', width: 2 },
                areaStyle: { color: 'rgba(59,130,246,0.1)' },
                animation: false,
            },
        ],
    };

    return <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />;
}
