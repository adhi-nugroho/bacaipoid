import React from 'react';

interface DonutData {
    label: string;
    value: number; // persentase (0-100)
    color: string;
}

interface DonutChartProps {
    data: DonutData[];
    size?: number;
    thickness?: number;
}

export default function DonutChart({ data, size = 220, thickness = 32 }: DonutChartProps) {
    const validData = data.filter(d => d.value > 0);
    if (validData.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-xs text-cream-400/70">Tidak ada data</span>
            </div>
        );
    }

    const total = validData.reduce((sum, d) => sum + d.value, 0);
    const radius = (size - thickness) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
                {validData.map((item, idx) => {
                    const pct = item.value / total;
                    const dashLength = pct * circumference;
                    const dashOffset = -offset;

                    offset += dashLength;

                    return (
                        <circle
                            key={idx}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={thickness}
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={dashOffset}
                            transform={`rotate(-90 ${center} ${center})`}
                            className="transition-all duration-500"
                            style={{ strokeLinecap: 'butt' }}
                        >
                            <title>{`${item.label}: ${item.value}%`}</title>
                        </circle>
                    );
                })}
                {/* Label tengah */}
                <text
                    x={center}
                    y={center - 6}
                    textAnchor="middle"
                    className="fill-cream-50 text-lg font-black"
                    fontSize="18"
                >
                    {total.toFixed(0)}%
                </text>
                <text
                    x={center}
                    y={center + 14}
                    textAnchor="middle"
                    className="fill-cream-400"
                    fontSize="10"
                >
                    Total Dana
                </text>
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {validData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-cream-400">{item.label}</span>
                        <span className="font-bold text-cream-100">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
