import React, { useEffect } from 'react';
import Card from '../Atoms/Card';
import Badge from '../Atoms/Badge';
import {
    HiOutlineScale,
    HiOutlineTrendingUp,
    HiOutlineInformationCircle,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { TbBrain, TbLoader2 } from 'react-icons/tb';
import { useValuationStore } from '../../stores';
import { reloadValuation } from '../../api/valuation';
import type {
    AiValuationResult,
    FinancialYearData,
    PeerGroup,
} from '../../types';

export type FinancialSummaryData = FinancialYearData & {
    id: number;
    total_assets: number | null;
    total_liabilities: number | null;
    total_equity: number | null;
    debt_to_equity_ratio: number | null;
    current_ratio: number | null;
    roe: number | null;
    roa: number | null;
};

interface ValuationSectionProps {
    ipo: {
        code: string;
        company_name: string;
        sector: string;
        ipo_price: number;
        offering_shares: number;
        ownership?: {
            dilution_percentage: number;
        };
        financials: {
            financial_data: FinancialSummaryData[];
        };
    };
    /** Server-computed valuation, delivered as a deferred Inertia prop. */
    valuation?: AiValuationResult | { error: string; config_missing?: boolean };
}

// Peer data dictionary based on code
const PEER_DATA: Record<string, PeerGroup> = {
    RANS: {
        category: 'Media & Ekonomi Kreatif',
        peers: [
            { name: 'PT MD Pictures Tbk', code: 'FILM', pe: 54.2, pbv: 8.4, roe: 15.5 },
            { name: 'PT Surya Citra Media Tbk', code: 'SCMA', pe: 16.4, pbv: 1.2, roe: 7.3 },
            { name: 'PT Media Nusantara Citra Tbk', code: 'MNCN', pe: 4.8, pbv: 0.28, roe: 5.8 },
            { name: 'PT Net Visi Media Tbk', code: 'NETV', pe: -2.1, pbv: -1.5, roe: -12.0 },
        ],
        fairPriceMultiplierMin: 18,
        fairPriceMultiplierMax: 26,
        valuationDescription: 'Valuasi RANS Entertainment (PE 30x) tergolong premium dibanding media penyiaran konvensional seperti SCMA atau MNCN. Namun, harga ini dinilai wajar (moderate) jika dibandingkan dengan FILM (MD Pictures) yang dihargai PE > 50x karena potensi monetisasi IP digital dan ekosistem kreatif Raffi-Nagita yang memiliki pertumbuhan tinggi.'
    },
    JELI: {
        category: 'Makanan & Minuman Olahan (F&B)',
        peers: [
            { name: 'PT Mayora Indah Tbk', code: 'MYOR', pe: 19.5, pbv: 2.8, roe: 14.3 },
            { name: 'PT Indofood CBP Sukses Makmur Tbk', code: 'ICBP', pe: 14.8, pbv: 2.1, roe: 14.1 },
            { name: 'PT Cisarua Mountain Dairy Tbk', code: 'CMRY', pe: 24.1, pbv: 3.6, roe: 14.9 },
            { name: 'PT Nippon Indosari Corpindo Tbk', code: 'ROTI', pe: 13.5, pbv: 2.2, roe: 16.3 },
        ],
        fairPriceMultiplierMin: 14,
        fairPriceMultiplierMax: 20,
        valuationDescription: 'PT Niramas Utama Tbk (INACO) menawarkan saham dengan fundamental sangat kuat (ROE 26.82%). Rentang harga IPO di PE ~20x tergolong wajar dan sejalan dengan rata-rata industri makanan olahan premium (MYOR dan CMRY).'
    },
    JECX: {
        category: 'Pelayanan Kesehatan & Rumah Sakit',
        peers: [
            { name: 'PT Medikaloka Hermina Tbk', code: 'HEAL', pe: 28.4, pbv: 3.2, roe: 11.2 },
            { name: 'PT Siloam International Hospitals Tbk', code: 'SILO', pe: 22.1, pbv: 2.4, roe: 10.8 },
            { name: 'PT Mitra Keluarga Karyasehat Tbk', code: 'MIKA', pe: 32.5, pbv: 4.8, roe: 14.7 },
            { name: 'PT Prodia Widyahusada Tbk', code: 'PRDA', pe: 14.2, pbv: 1.8, roe: 12.6 },
        ],
        fairPriceMultiplierMin: 20,
        fairPriceMultiplierMax: 28,
        valuationDescription: 'JEC Eye Hospitals (JECX) berada pada sektor defensif dengan margin stabil. Valuasi IPO berada pada tingkat menengah dibanding kompetitor rumah sakit umum besar (HEAL, MIKA) yang memiliki multiple PE rata-rata di atas 25x.'
    },
    EMMI: {
        category: 'Alat Kesehatan & Farmasi',
        peers: [
            { name: 'PT Itama Ranoraya Tbk', code: 'IRRA', pe: 18.5, pbv: 1.4, roe: 7.5 },
            { name: 'PT Kalbe Farma Tbk', code: 'KLBF', pe: 22.3, pbv: 2.5, roe: 11.2 },
            { name: 'PT Tempo Scan Pacific Tbk', code: 'TSPC', pe: 10.2, pbv: 1.1, roe: 10.7 },
        ],
        fairPriceMultiplierMin: 12,
        fairPriceMultiplierMax: 18,
        valuationDescription: 'PT Esa Medika Mandiri Tbk (EMMI) memiliki tingkat liabilitas yang relatif tinggi (DER 2.89x) dan ROE rendah di 0.46%. Dibandingkan KLBF atau TSPC, valuasi EMMI dinilai premium dan mengandung risiko finansial terstruktur.'
    },
    PRDL: {
        category: 'Laboratorium & Diagnostik Klinis',
        peers: [
            { name: 'PT Prodia Widyahusada Tbk', code: 'PRDA', pe: 14.2, pbv: 1.8, roe: 12.6 },
            { name: 'PT Diagnos Laboratorium Utama Tbk', code: 'DGNS', pe: 21.0, pbv: 1.6, roe: 7.6 },
        ],
        fairPriceMultiplierMin: 13,
        fairPriceMultiplierMax: 19,
        valuationDescription: 'Prodia Diagnostic Line (PRDL) menunjukkan efisiensi operasional yang baik (ROE 20.45%). Valuasi harga IPO tergolong atraktif bila disandingkan dengan induk usahanya (PRDA) dan potensial mencatatkan pertumbuhan pasca listing.'
    },
    BACH: {
        category: 'Perdagangan & Distribusi Industri',
        peers: [
            { name: 'PT United Tractors Tbk', code: 'UNTR', pe: 4.5, pbv: 0.9, roe: 20.2 },
            { name: 'PT Kobexindo Tractors Tbk', code: 'KOBX', pe: 6.2, pbv: 0.7, roe: 11.3 },
            { name: 'PT Hexindo Adiperkasa Tbk', code: 'HEXA', pe: 7.1, pbv: 1.8, roe: 25.4 },
        ],
        fairPriceMultiplierMin: 5,
        fairPriceMultiplierMax: 8,
        valuationDescription: 'BACH Multi Global beroperasi di sektor perdagangan industri. Valuasi emiten siklikal di sektor ini biasanya rendah secara P/E ratio. Dengan tingkat ROE 29.02%, saham BACH menawarkan potensi undervalue jika dibandingkan kompetitor.'
    },
};

function SkeletonBox({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-ink-800 rounded ${className}`} />;
}

function formatRupiah(val: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 2,
    }).format(val);
}

export default function ValuationSection({ ipo, valuation }: ValuationSectionProps) {
    const latestFin = ipo.financials?.financial_data?.[0];
    const code = ipo.code;
    const peerInfo = PEER_DATA[code] || {
        category: 'Sektor Sejenis',
        peers: [],
        fairPriceMultiplierMin: 12,
        fairPriceMultiplierMax: 18,
        valuationDescription: 'Data perbandingan sektor sejenis belum dikonfigurasi sepenuhnya.'
    };

    // Calculate total shares outstanding
    const dilutionPct = ipo.ownership?.dilution_percentage ?? 20.0;
    const dilutionFraction = dilutionPct / 100;
    const totalShares = dilutionFraction > 0 ? ipo.offering_shares / dilutionFraction : ipo.offering_shares * 5;

    // Calculate valuation multiples from financial data
    let eps = 0;
    let bvps = 0;
    let pe = 0;
    let pbv = 0;
    let roeVal = 0;

    if (latestFin) {
        eps = (latestFin.net_income ?? 0) / totalShares;
        bvps = (latestFin.total_equity ?? 0) / totalShares;
        pe = eps > 0 ? ipo.ipo_price / eps : 0;
        pbv = bvps > 0 ? ipo.ipo_price / bvps : 0;
        roeVal = latestFin.roe ?? 0;
    }

    const epsValid = eps > 0;

    // AI valuation is computed server-side and delivered as a deferred prop.
    // The store holds it across tab switches / visits.
    const aiResult = useValuationStore((state) => state.results[code] ?? null);
    const aiError = useValuationStore((state) => state.errors[code] ?? null);
    const aiNotConfigured = useValuationStore(
        (state) => state.notConfigured[code] ?? false,
    );
    const setResult = useValuationStore((state) => state.setResult);
    const setError = useValuationStore((state) => state.setError);
    const setNotConfigured = useValuationStore(
        (state) => state.setNotConfigured,
    );

    // When the deferred prop arrives, settle it into the store.
    useEffect(() => {
        if (!valuation) return;

        if ('error' in valuation) {
            if (valuation.config_missing) {
                setNotConfigured(code);
            } else {
                setError(code, valuation.error);
            }
            return;
        }

        setResult(code, valuation);
    }, [valuation, code, setResult, setError, setNotConfigured]);

    // Deferred props resolve after paint; treat "needed but not set" as loading.
    const aiLoading = !epsValid && !aiResult && !aiError && !aiNotConfigured;

    // Determine which fair price to use: AI result or EPS-based
    const effectiveFairPriceMin = epsValid
        ? Math.round(eps * peerInfo.fairPriceMultiplierMin)
        : (aiResult?.fair_price_min ?? 0);
    const effectiveFairPriceMax = epsValid
        ? Math.round(eps * peerInfo.fairPriceMultiplierMax)
        : (aiResult?.fair_price_max ?? 0);
    const effectivePeMin = aiResult?.pe_multiplier_min ?? peerInfo.fairPriceMultiplierMin;
    const effectivePeMax = aiResult?.pe_multiplier_max ?? peerInfo.fairPriceMultiplierMax;

    // Determine valuation status
    let valuationStatus: 'undervalued' | 'fair' | 'overvalued' = 'fair';
    let statusLabel = 'Fairly Valued';
    let statusColor = 'text-copper-300 bg-copper-300/[0.06] ring-copper-400/20';
    let AlertIcon = HiOutlineInformationCircle;

    if (effectiveFairPriceMin > 0) {
        if (ipo.ipo_price < effectiveFairPriceMin * 0.95) {
            valuationStatus = 'undervalued';
            statusLabel = 'Undervalued (Murah)';
            statusColor = 'text-emerald-400 bg-emerald-400/[0.06] ring-emerald-500/20';
            AlertIcon = HiOutlineCheckCircle;
        } else if (ipo.ipo_price > effectiveFairPriceMax * 1.05) {
            valuationStatus = 'overvalued';
            statusLabel = 'Overvalued (Mahal)';
            statusColor = 'text-rose-400 bg-rose-400/[0.06] ring-rose-500/20';
            AlertIcon = HiOutlineExclamationCircle;
        }
    } else if (aiResult) {
        // Gunakan status dari AI jika fair price belum tersedia
        if (aiResult.valuation_status === 'undervalued') {
            valuationStatus = 'undervalued';
            statusLabel = 'Undervalued (Murah)';
            statusColor = 'text-emerald-400 bg-emerald-400/[0.06] ring-emerald-500/20';
            AlertIcon = HiOutlineCheckCircle;
        } else if (aiResult.valuation_status === 'overvalued') {
            valuationStatus = 'overvalued';
            statusLabel = 'Overvalued (Mahal)';
            statusColor = 'text-rose-400 bg-rose-400/[0.06] ring-rose-500/20';
            AlertIcon = HiOutlineExclamationCircle;
        }
    }


    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Analisis Valuasi & Estimasi Harga Wajar</h3>
                <p className="text-xs text-cream-400/70">
                    Membandingkan harga penawaran IPO dengan profitabilitas riil perusahaan, analisis AI, dan emiten pembanding di Bursa Efek Indonesia.
                </p>
            </div>

            {/* Valuation Alert Card */}
            <div className={`flex gap-3 p-4 rounded-xl ring-1 ${statusColor}`}>
                <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                    <span className="font-bold uppercase tracking-wide text-[10px] block mb-1">
                        Kesimpulan Valuasi: {statusLabel}
                    </span>
                    <p className="text-[11px] text-cream-200">
                        Harga Penawaran IPO sebesar{' '}
                        <strong className="text-cream-50">{formatRupiah(ipo.ipo_price)}</strong> per lembar saham.{' '}
                        {epsValid ? (
                            <>
                                Berdasarkan laba bersih tahun {latestFin?.year || 2025} dan kelayakan multiples sektor{' '}
                                {peerInfo.category}, estimasi rentang harga wajar berada di antara{' '}
                                <strong className="text-cream-50">{formatRupiah(effectiveFairPriceMin)}</strong> hingga{' '}
                                <strong className="text-cream-50">{formatRupiah(effectiveFairPriceMax)}</strong>.
                            </>
                        ) : aiResult ? (
                            <>
                                Berdasarkan analisis AI (deepseek-v4-pro) menggunakan data sektor, fundamental perusahaan,
                                dan perbandingan industri, estimasi rentang harga wajar berada di antara{' '}
                                <strong className="text-cream-50">{formatRupiah(aiResult.fair_price_min)}</strong> hingga{' '}
                                <strong className="text-cream-50">{formatRupiah(aiResult.fair_price_max)}</strong>.
                            </>
                        ) : aiLoading ? (
                            <span className="text-cream-400/70 italic">AI sedang menghitung estimasi harga wajar...</span>
                        ) : (
                            <>
                                Berdasarkan data sektor {peerInfo.category}, estimasi harga wajar sedang dihitung oleh AI.
                                {aiError && <span className="text-rose-400 block mt-1">Gagal menghitung: {aiError}</span>}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Valuation Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Loading Skeleton for Multiples */}
                    <Card>
                        <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10">
                            Multiples Valuasi Emiten
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                <span className="text-[10px] text-cream-400/70 block mb-1 uppercase tracking-wide">P/E Ratio (Laba)</span>
                                <span className="text-lg font-black text-cream-50">{pe > 0 ? `${pe.toFixed(1)}x` : 'N/A'}</span>
                            </div>
                            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                <span className="text-[10px] text-cream-400/70 block mb-1 uppercase tracking-wide">P/BV Ratio (Buku)</span>
                                <span className="text-lg font-black text-cream-50">{pbv > 0 ? `${pbv.toFixed(1)}x` : 'N/A'}</span>
                            </div>
                            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                <span className="text-[10px] text-cream-400/70 block mb-1 uppercase tracking-wide">Laba Per Saham (EPS)</span>
                                <span className="text-lg font-black text-cream-50">{formatRupiah(eps)}</span>
                            </div>
                            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                <span className="text-[10px] text-cream-400/70 block mb-1 uppercase tracking-wide">Nilai Buku Per Saham</span>
                                <span className="text-lg font-black text-cream-50">{formatRupiah(bvps)}</span>
                            </div>
                        </div>

                        {/* PE Multiplier Info */}
                        {!epsValid && aiResult && (
                            <div className="mt-4 p-3 bg-cyan-500/[0.04] border border-cyan-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <TbBrain className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                                        AI Multiplier yang Digunakan
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-cream-400/70">P/E Min:</span>{' '}
                                        <span className="font-bold text-cream-100">{effectivePeMin.toFixed(1)}x</span>
                                    </div>
                                    <div>
                                        <span className="text-cream-400/70">P/E Max:</span>{' '}
                                        <span className="font-bold text-cream-100">{effectivePeMax.toFixed(1)}x</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fair Price Visualization */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <span className="text-[10px] text-cream-400/70 block mb-3 uppercase tracking-wide">
                                Perbandingan Harga IPO dan Estimasi Harga Wajar
                            </span>

                            {aiLoading ? (
                                <div className="space-y-3 py-4">
                                    <SkeletonBox className="h-2 w-full" />
                                    <div className="flex justify-between">
                                        <SkeletonBox className="h-3 w-24" />
                                        <SkeletonBox className="h-3 w-24" />
                                        <SkeletonBox className="h-3 w-24" />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-copper-400/[0.06] ring-1 ring-copper-400/20 p-4">
                                        <span className="text-[10px] uppercase tracking-wide text-copper-300">Harga IPO</span>
                                        <strong className="block text-xl text-cream-50 mt-1">{formatRupiah(ipo.ipo_price)}</strong>
                                    </div>
                                    <div className="rounded-xl bg-emerald-500/[0.05] ring-1 ring-emerald-500/15 p-4">
                                        <span className="text-[10px] uppercase tracking-wide text-emerald-400">Rentang Estimasi</span>
                                        <strong className="block text-sm text-cream-50 mt-1">
                                            {effectiveFairPriceMin > 0
                                                ? `${formatRupiah(effectiveFairPriceMin)} – ${formatRupiah(effectiveFairPriceMax)}`
                                                : 'Belum tersedia'}
                                        </strong>
                                    </div>
                                    <div className="rounded-xl bg-white/[0.025] ring-1 ring-white/5 p-4">
                                        <span className="text-[10px] uppercase tracking-wide text-cream-400/70">Kesimpulan</span>
                                        <strong className={`block text-sm mt-1 ${
                                            valuationStatus === 'undervalued'
                                                ? 'text-emerald-400'
                                                : valuationStatus === 'overvalued'
                                                    ? 'text-rose-400'
                                                    : 'text-sky-400'
                                        }`}>
                                            {valuationStatus === 'undervalued'
                                                ? 'Di bawah rentang wajar'
                                                : valuationStatus === 'overvalued'
                                                    ? 'Di atas rentang wajar'
                                                    : 'Dalam rentang wajar'}
                                        </strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Sector Peer Comparison Table */}
                    <Card>
                        <h4 className="font-bold text-sm text-cream-100 mb-2 pb-3 border-b border-white/10 flex items-center justify-between">
                            <span>Perbandingan dengan Emiten Sektor Sejenis</span>
                            <span className="text-[10px] font-normal text-cream-400/70">Sektor: {peerInfo.category}</span>
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-xs">
                                <thead>
                                    <tr>
                                        <th className="py-2 pr-4 text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">Kode Saham</th>
                                        <th className="py-2 px-4 text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">Nama Emiten</th>
                                        <th className="py-2 px-4 text-right text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">P/E Ratio</th>
                                        <th className="py-2 px-4 text-right text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">P/BV Ratio</th>
                                        <th className="py-2 pl-4 text-right text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">ROE (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="bg-copper-400/[0.04] font-bold">
                                        <td className="py-3 pr-4 text-copper-300">{ipo.code} (IPO)</td>
                                        <td className="py-3 px-4 text-cream-100">{ipo.company_name}</td>
                                        <td className="py-3 px-4 text-right text-copper-300">{pe > 0 ? `${pe.toFixed(1)}x` : 'N/A'}</td>
                                        <td className="py-3 px-4 text-right text-copper-300">{pbv > 0 ? `${pbv.toFixed(1)}x` : 'N/A'}</td>
                                        <td className="py-3 pl-4 text-right text-copper-300">{roeVal.toFixed(1)}%</td>
                                    </tr>
                                    {peerInfo.peers.map((peer, idx) => (
                                        <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-3 pr-4 font-semibold text-cream-400">{peer.code}</td>
                                            <td className="py-3 px-4 text-cream-200">{peer.name}</td>
                                            <td className="py-3 px-4 text-right text-cream-400">
                                                {peer.pe < 0 ? 'Negatif' : `${peer.pe.toFixed(1)}x`}
                                            </td>
                                            <td className="py-3 px-4 text-right text-cream-400">
                                                {peer.pbv < 0 ? 'Negatif' : `${peer.pbv.toFixed(2)}x`}
                                            </td>
                                            <td className="py-3 pl-4 text-right text-cream-400">{peer.roe.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right side: Descriptive Analysis + AI Methodology */}
                <div className="space-y-4">
                    {/* Analis Notes */}
                    <Card>
                        <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
                            <HiOutlineScale className="w-4 h-4 text-copper-300" />
                            Catatan Analis Valuasi
                        </h4>
                        <div className="space-y-4 text-xs leading-relaxed text-cream-400">
                            <p>{peerInfo.valuationDescription}</p>
                            <div className="border-t border-white/5 pt-4">
                                <span className="text-[10px] text-cream-400/70 uppercase tracking-wide block mb-2">Pilar Evaluasi Harga:</span>
                                <ul className="space-y-2 text-[11px]">
                                    <li className="flex gap-2">
                                        <span className="text-copper-300 font-bold">1.</span>
                                        <span><strong>Profitabilitas Riil</strong>: Multiples dihitung berdasarkan Laba Bersih Tahun {latestFin?.year || 2025} yang diaudit, meminimalisir manipulasi laporan sementara.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-copper-300 font-bold">2.</span>
                                        <span><strong>Sinyal Dilusi</strong>: Besaran dilusi kepemilikan ({dilutionPct}%) turut disesuaikan sebagai pengurang nilai wajar lembar saham.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-copper-300 font-bold">3.</span>
                                        <span><strong>Dukungan Sektor</strong>: Multiples harga wajar didasarkan pada pergerakan historis P/E rata-rata sektor terdekat di Bursa Efek Indonesia.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    {/* AI Methodology Card */}
                    {aiLoading && (
                        <Card>
                            <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
                                <TbLoader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                AI Menghitung Valuasi...
                            </h4>
                            <div className="space-y-2">
                                <SkeletonBox className="h-3 w-full" />
                                <SkeletonBox className="h-3 w-5/6" />
                                <SkeletonBox className="h-3 w-4/6" />
                                <SkeletonBox className="h-3 w-full" />
                                <SkeletonBox className="h-3 w-3/6" />
                            </div>
                        </Card>
                    )}

                    {aiResult && (
                        <Card>
                            <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
                                <TbBrain className="w-4 h-4 text-cyan-400" />
                                Metodologi Perhitungan AI
                            </h4>
                            <div className="space-y-3 text-xs leading-relaxed text-cream-400">
                                <div className="flex items-center gap-2 text-[10px] text-cream-400/70 mb-1">
                                    <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded font-bold uppercase tracking-wide">
                                        deepseek-v4-pro
                                    </span>
                                    <span>via Sumopod</span>
                                </div>
                                {aiResult.pe_multiplier_min && (
                                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                                        <span className="text-[10px] text-cream-400/70 block mb-1">Rentang P/E Wajar</span>
                                        <span className="font-bold text-cream-100">
                                            {aiResult.pe_multiplier_min.toFixed(1)}x - {aiResult.pe_multiplier_max?.toFixed(1) ?? '?'}x
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-[10px] text-cream-400/70 uppercase tracking-wide block mb-2">
                                        Penjelasan Perhitungan
                                    </span>
                                    <p className="text-[11px] whitespace-pre-line">{aiResult.methodology}</p>
                                </div>
                                <div className="border-t border-white/5 pt-3 flex items-start gap-2">
                                    <HiOutlineInformationCircle className="w-3.5 h-3.5 text-cream-400/50 flex-shrink-0 mt-0.5" />
                                    <span className="text-[10px] text-cream-400/50">
                                        Estimasi ini dihasilkan oleh AI dan bersifat informatif. Bukan rekomendasi investasi.
                                        Selalu lakukan riset mandiri sebelum berinvestasi.
                                    </span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {aiNotConfigured && !epsValid && (
                        <Card>
                            <div className="text-center py-4">
                                <HiOutlineInformationCircle className="w-6 h-6 text-cream-400/70 mx-auto mb-2" />
                                <p className="text-xs text-cream-400 mb-1">Estimasi AI Belum Dikonfigurasi</p>
                                <p className="text-[10px] text-cream-400/50">
                                    Konfigurasikan Sumopod API key untuk mengaktifkan estimasi harga wajar berbasis AI.
                                </p>
                            </div>
                        </Card>
                    )}

                    {aiError && !aiResult && !aiNotConfigured && (
                        <Card>
                            <div className="text-center py-4">
                                <HiOutlineExclamationCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                                <p className="text-xs text-rose-400 mb-1">Gagal memuat estimasi AI</p>
                                <p className="text-[10px] text-cream-400/70">{aiError}</p>
                                <button
                                    type="button"
                                    onClick={() => reloadValuation()}
                                    className="mt-4 rounded-full bg-copper-600 px-5 py-2 text-xs font-semibold text-ink-950 transition-all duration-700 ease-silk hover:bg-copper-400 active:scale-[0.98]"
                                >
                                    Coba lagi
                                </button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
