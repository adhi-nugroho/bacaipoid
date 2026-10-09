import React from 'react';
import Card from '../Atoms/Card';
import Badge from '../Atoms/Badge';
import FinancialRatioItem from '../Molecules/FinancialRatioItem';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { TbChartBar, TbCertificate } from 'react-icons/tb';
import type { FinancialSummaryDetails } from '../../types';

interface FinancialSummarySectionProps {
    details: FinancialSummaryDetails;
}

export default function FinancialSummarySection({ details }: FinancialSummarySectionProps) {
    const formatBillions = (value: number | null) => {
        if (value === null) return 'Tidak tersedia';
        const abs = Math.abs(value);
        if (abs >= 1_000_000_000_000) {
            return `${(value / 1_000_000_000_000).toFixed(1)} T`;
        }
        if (abs >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(1)} M`;
        }
        if (abs >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1)} Jt`;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const sortedData = [...details.financial_data].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    const latestYearData = sortedData[sortedData.length - 1];

    const getOpinionBadgeVariant = (opinion: string | null) => {
        if (!opinion) return 'gray' as const;
        const op = opinion.toUpperCase();
        if (op.includes('WTP') || op.includes('WAJAR TANPA PENGECUALIAN') || op.includes('UNQUALIFIED')) {
            return 'emerald' as const;
        }
        if (op.includes('WDP') || op.includes('DENGAN PENGECUALIAN') || op.includes('QUALIFIED')) {
            return 'amber' as const;
        }
        return 'danger' as const;
    };

    const maxRevenue = Math.max(0, ...sortedData.map(d => d.revenue ?? 0));
    const maxAbsIncome = Math.max(0, ...sortedData.map(d => Math.abs(d.net_income ?? 0)));
    const maxVal = Math.max(maxRevenue, maxAbsIncome) || 1;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Kondisi Keuangan & Opini Auditor</h3>
                <p className="text-xs text-cream-400/70">
                    Kinerja laba/rugi, status hasil audit laporan keuangan, dan analisis rasio utang/profitabilitas.
                </p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opini Auditor */}
                <Card className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center ring-1 ring-white/5 flex-shrink-0">
                            <TbCertificate className="w-5 h-5 text-cream-400" />
                        </div>
                        <div>
                            <span className="text-[10px] text-cream-400/70 uppercase tracking-wide block mb-0.5">Opini Auditor</span>
                            <span className="font-bold text-cream-50 text-sm leading-snug">
                                {details.auditor_opinion ?? 'Belum tersedia di prospektus'}
                            </span>
                        </div>
                    </div>
                    <Badge variant={getOpinionBadgeVariant(details.auditor_opinion)}>
                        AUDITED
                    </Badge>
                </Card>

                {/* Non-Recurring Warning */}
                {latestYearData?.is_non_recurring_highlighted && (
                    <div className="flex gap-3 p-4 rounded-xl bg-copper-400/[0.06] ring-1 ring-copper-400/15">
                        <HiOutlineExclamationCircle className="w-5 h-5 text-copper-300 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="text-[10px] font-bold text-copper-300 uppercase tracking-wide block mb-1">
                                Catatan Transaksi Non-Recurring
                            </span>
                            <p className="text-[11px] text-copper-300/80 leading-relaxed">
                                {latestYearData.non_recurring_details}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart Tren */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/10">
                            <TbChartBar className="w-4 h-4 text-cream-400/70" />
                            <h4 className="font-bold text-sm text-cream-100">Tren Pendapatan vs Laba Bersih</h4>
                        </div>

                        <div className="flex items-center gap-5 mb-4 text-[10px] font-semibold text-cream-400/70">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-copper-500" />
                                Pendapatan
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                                Laba Bersih
                            </span>
                        </div>

                        <div className="h-64 flex items-end justify-around gap-4 border-b border-white/[0.08] px-2">
                            {sortedData.map((d) => {
                                const isNegative = (d.net_income ?? 0) < 0;
                                const revenueHeight = Math.max(3, ((d.revenue ?? 0) / maxVal) * 100);
                                const incomeHeight = Math.max(3, (Math.abs(d.net_income ?? 0) / maxVal) * 100);

                                return (
                                    <div key={d.id} className="h-full flex-1 max-w-32 flex flex-col justify-end">
                                        <div className="flex-1 flex items-end justify-center gap-2">
                                            <div
                                                className="group/bar relative w-8 sm:w-11 rounded-t-md bg-copper-500 hover:bg-copper-400 transition-colors"
                                                style={{ height: `${revenueHeight}%` }}
                                                title={`Pendapatan ${d.year}: ${formatBillions(d.revenue)}`}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-cream-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                    {formatBillions(d.revenue)}
                                                </span>
                                            </div>
                                            <div
                                                className={`group/bar relative w-8 sm:w-11 rounded-t-md transition-colors ${
                                                    isNegative
                                                        ? 'bg-rose-500 hover:bg-rose-400'
                                                        : 'bg-sky-500 hover:bg-sky-400'
                                                }`}
                                                style={{ height: `${incomeHeight}%` }}
                                                title={`Laba bersih ${d.year}: ${formatBillions(d.net_income)}`}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-cream-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                    {isNegative ? `(${formatBillions(Math.abs(d.net_income ?? 0))})` : formatBillions(d.net_income)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="h-8 pt-2 text-center text-xs font-bold text-cream-400">
                                            {d.year ?? 'N/A'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Rasio Keuangan */}
                {latestYearData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <FinancialRatioItem
                            name="Debt-to-Equity (DER)"
                            value={latestYearData.debt_to_equity_ratio !== null ? `${latestYearData.debt_to_equity_ratio}x` : 'N/A'}
                            description="Mengukur penggunaan utang vs modal sendiri. DER > 2.0x menunjukkan eksposur utang yang tinggi."
                            status={(latestYearData.debt_to_equity_ratio ?? 0) > 2.0 ? 'warning' : 'good'}
                            statusLabel={(latestYearData.debt_to_equity_ratio ?? 0) > 2.0 ? 'Perlu Perhatian' : 'Sehat'}
                        />
                        <FinancialRatioItem
                            name="Return on Equity (ROE)"
                            value={latestYearData.roe !== null ? `${latestYearData.roe}%` : 'N/A'}
                            description="Tingkat pengembalian terhadap ekuitas pemegang saham. ROE tinggi = produktivitas modal efisien."
                            status={(latestYearData.roe ?? 0) > 10 ? 'good' : 'neutral'}
                            statusLabel={(latestYearData.roe ?? 0) > 10 ? 'Ekonomis' : 'Sedang'}
                        />
                        <FinancialRatioItem
                            name="Current Ratio (CR)"
                            value={latestYearData.current_ratio !== null ? `${latestYearData.current_ratio}x` : 'N/A'}
                            description="Kemampuan perusahaan memenuhi kewajiban jangka pendek. Di atas 1.0x berarti likuiditas lancar."
                            status={latestYearData.current_ratio !== null && latestYearData.current_ratio < 1.0 ? 'danger' : 'good'}
                            statusLabel={latestYearData.current_ratio !== null && latestYearData.current_ratio < 1.0 ? 'Risiko Likuiditas' : 'Sehat'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
