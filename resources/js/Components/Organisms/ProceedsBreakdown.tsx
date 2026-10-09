import React from 'react';
import Card from '../Atoms/Card';
import PieChart from '../Molecules/PieChart';
import type { ProceedAllocation } from '../../types';

interface ProceedsBreakdownProps {
    allocations: ProceedAllocation[];
}

const CATEGORY_COLORS: Record<string, string> = {
    debt_repayment: '#C2703A',
    capex: '#D68A54',
    working_capital: '#E3A87A',
    acquisition: '#B3A288',
    subsidiary_investment: '#E8DFCF',
    others: '#83461F',
};

const categoryLabels: Record<string, string> = {
    debt_repayment: 'Pelunasan Utang',
    capex: 'Capex / Ekspansi Usaha',
    working_capital: 'Modal Kerja',
    acquisition: 'Investasi Anak Usaha',
    subsidiary_investment: 'Penyertaan Modal ke Anak Usaha',
    others: 'Lainnya',
};

export default function ProceedsBreakdown({ allocations }: ProceedsBreakdownProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Urutkan persentase dari terbesar
    const sortedAllocations = [...allocations].sort((a, b) => b.percentage - a.percentage);

    const chartData = allocations
        .filter(a => a.percentage > 0)
        .map(alloc => ({
            label: categoryLabels[alloc.category] ?? alloc.category,
            value: Number(alloc.percentage),
            color: CATEGORY_COLORS[alloc.category] ?? CATEGORY_COLORS.others,
        }));

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Rencana Penggunaan Dana IPO</h3>
                <p className="text-xs text-cream-400">
                    Breakdown alokasi perolehan dana bersih dari hasil penawaran umum perdana saham.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Pie Chart */}
                <div className="lg:col-span-2">
                    <Card>
                        <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10">
                            Visualisasi Alokasi Dana
                        </h4>
                        <PieChart data={chartData} size={300} />
                    </Card>
                </div>

                {/* Penjelasan Detail */}
                <div className="lg:col-span-3">
                    <Card className="h-full">
                        <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10">
                            Rincian Penggunaan Dana
                        </h4>
                        <div className="space-y-2">
                            {sortedAllocations.map((alloc) => {
                                const color = CATEGORY_COLORS[alloc.category] ?? CATEGORY_COLORS.others;
                                return (
                                    <div
                                        key={alloc.id}
                                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/5 transition-colors duration-700 ease-silk"
                                    >
                                        {/* Row 1: Label + Nominal */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="font-semibold text-cream-50 text-sm truncate">
                                                    {categoryLabels[alloc.category] ?? alloc.category}
                                                </span>
                                            </div>
                                            {/* Persentase + Nominal berdampingan, bukan bertumpuk */}
                                            <div className="flex items-baseline gap-3 flex-shrink-0 ml-3">
                                                <span
                                                    className="text-base font-black tabular-nums"
                                                    style={{ color }}
                                                >
                                                    {alloc.percentage}%
                                                </span>
                                                <span className="text-sm font-semibold text-cream-100 tabular-nums">
                                                    ({formatCurrency(alloc.amount)})
                                                </span>
                                            </div>
                                        </div>
                                        {/* Deskripsi */}
                                        {alloc.description && (
                                            <p className="text-xs text-cream-400 leading-relaxed">
                                                {alloc.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
