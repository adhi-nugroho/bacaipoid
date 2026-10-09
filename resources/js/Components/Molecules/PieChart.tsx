import React from 'react';

interface PieData {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieData[];
    size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
    };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

function isLightColor(hex: string): boolean {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}

const SHORT_LABELS: Record<string, string> = {
    'Pelunasan Utang': 'Utang',
    'Capex / Ekspansi Usaha': 'Capex',
    'Modal Kerja': 'Modal\nKerja',
    'Investasi Anak Usaha': 'Investasi\nAnak',
    'Penyertaan Modal ke Anak Usaha': 'Penyertaan\nModal',
};

export default function PieChart({ data, size = 320 }: PieChartProps) {
    const validData = data.filter(d => d.value > 0);
    if (validData.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-xs text-cream-400/70">Tidak ada data</span>
            </div>
        );
    }

    const total = validData.reduce((sum, d) => sum + d.value, 0);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;
    const labelRadius = radius * 0.62;

    let cumAngle = -Math.PI / 2; // mulai dari atas

    return (
        <div className="flex justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="select-none"
            >
                {validData.map((item, idx) => {
                    const sliceAngle = (item.value / total) * (2 * Math.PI);
                    const startAngle = cumAngle;
                    const endAngle = cumAngle + sliceAngle;
                    const midAngle = cumAngle + sliceAngle / 2;

                    cumAngle = endAngle;

                    const path = describeArc(cx, cy, radius, startAngle, endAngle);

                    // Posisi teks
                    const textPos = polarToCartesian(cx, cy, labelRadius, midAngle);
                    const useLightText = !isLightColor(item.color);
                    const shortLabel = SHORT_LABELS[item.label] ?? item.label;
                    const lines = shortLabel.split('\n');

                    // Hanya render label jika slice cukup besar
                    const pct = (item.value / total) * 100;
                    const showLabel = pct >= 5;

                    return (
                        <g key={idx}>
                            <path
                                d={path}
                                fill={item.color}
                                stroke="#12100C"
                                strokeWidth="1.5"
                                className="transition-all duration-300 hover:opacity-90"
                            >
                                <title>{`${item.label}: ${item.value}%`}</title>
                            </path>
                            {showLabel && (
                                <text
                                    x={textPos.x}
                                    y={textPos.y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={useLightText ? '#F6F1E8' : '#12100C'}
                                    className="pointer-events-none"
                                    style={{ textShadow: useLightText ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}
                                >
                                    {lines.map((line, li) => (
                                        <tspan
                                            key={li}
                                            x={textPos.x}
                                            dy={li === 0 ? -(lines.length - 1) * 6 : 12}
                                            fontSize={lines.length > 1 ? "10" : "11"}
                                            fontWeight="700"
                                        >
                                            {line}
                                        </tspan>
                                    ))}
                                    <tspan
                                        x={textPos.x}
                                        dy={lines.length > 1 ? 12 : 14}
                                        fontSize="13"
                                        fontWeight="900"
                                    >
                                        {pct.toFixed(1)}%
                                    </tspan>
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
