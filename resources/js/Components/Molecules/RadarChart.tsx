import React from 'react';

interface RadarData {
    label: string;
    value: number; // persentase (0-100)
}

interface RadarChartProps {
    data: RadarData[];
    size?: number;
}

export default function RadarChart({ data, size = 300 }: RadarChartProps) {
    const N = data.length;
    const center = 150;
    const radius = 100;

    if (N < 3) {
        // Fallback jika sumbu kurang dari 3, tampilkan bar chart horizontal mini yang cantik dengan SVG
        return (
            <div className="flex flex-col justify-center space-y-4 p-4 border border-cream-200 rounded-lg bg-ink-900/50 w-full">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-cream-100">
                            <span>{item.label}</span>
                            <span>{item.value}%</span>
                        </div>
                        <div className="w-full h-3 bg-ink-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-copper-500 rounded-full"
                                style={{ width: `${item.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Hitung sudut untuk setiap sumbu
    const angles = Array.from({ length: N }, (_, i) => (2 * Math.PI * i) / N - Math.PI / 2);

    // Hitung koordinat untuk poligon grid konsentris (25%, 50%, 75%, 100%)
    const getGridPoints = (level: number) => {
        const r = radius * level;
        return angles.map(angle => {
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    };

    // Hitung koordinat untuk area data
    const dataPoints = data.map((item, i) => {
        const r = radius * (Math.min(item.value, 100) / 100);
        const angle = angles[i];
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y, label: item.label, value: item.value };
    });

    const dataPolygonString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    // Hitung koordinat label teks (sedikit di luar ujung sumbu)
    const labelPoints = angles.map((angle, i) => {
        const r = radius + 22; // 22px padding di luar lingkaran
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        
        // Atur text-anchor berdasarkan posisi x
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (Math.cos(angle) > 0.1) {
            textAnchor = 'start';
        } else if (Math.cos(angle) < -0.1) {
            textAnchor = 'end';
        }

        return { x, y, textAnchor, label: data[i].label };
    });

    const gridLevels = [0.25, 0.5, 0.75, 1.0];

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <svg 
                viewBox={`0 0 ${size} ${size}`} 
                width="100%" 
                height="100%" 
                className="max-w-[340px] select-none"
            >
                {/* Grid Poligon Konsentris */}
                {gridLevels.map((level, idx) => (
                    <polygon
                        key={idx}
                        points={getGridPoints(level)}
                        fill="none"
                        stroke="#322A20"
                        strokeWidth="1"
                        strokeDasharray={level < 1 ? "3 3" : "none"}
                    />
                ))}

                {/* Garis Grid Sumbu (Radii) */}
                {angles.map((angle, idx) => {
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={idx}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="#322A20"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Area Data Poligon */}
                <polygon
                    points={dataPolygonString}
                    fill="rgba(194, 112, 58, 0.15)"
                    stroke="#C2703A"
                    strokeWidth="2"
                />

                {/* Titik Data (Lingkaran) */}
                {dataPoints.map((p, idx) => (
                    <g key={idx} className="group cursor-pointer">
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="4.5"
                            fill="#C2703A"
                            stroke="#FDFBF7"
                            strokeWidth="1.5"
                            className="transition-all duration-200 hover:r-6 hover:fill-copper-700"
                        />
                        <title>{`${p.label}: ${p.value}%`}</title>
                    </g>
                ))}

                {/* Label Kategori */}
                {labelPoints.map((lp, idx) => {
                    // Batasi panjang teks label agar tidak overflow dari area SVG
                    const shortLabel = lp.label.length > 20 ? lp.label.substring(0, 18) + '...' : lp.label;
                    return (
                        <text
                            key={idx}
                            x={lp.x}
                            y={lp.y + 4} // Koreksi vertikal
                            textAnchor={lp.textAnchor}
                            fill="#B3A288"
                            fontSize="9"
                            fontWeight="bold"
                            className="font-sans fill-cream-400"
                        >
                            {shortLabel}
                            <title>{lp.label}</title>
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
