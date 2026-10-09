import React from 'react';
import Card from '../Atoms/Card';
import { HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi';
import { TbUsers } from 'react-icons/tb';
import type { RelatedPartyDetails } from '../../types';

interface RelatedPartySectionProps {
    details: RelatedPartyDetails;
}

export default function RelatedPartySection({ details }: RelatedPartySectionProps) {
    const isHighExposure = details.percentage > 20;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Transaksi dengan Pihak Berelasi (Afiliasi)</h3>
                <p className="text-xs text-cream-400/70">
                    Analisis tingkat ketergantungan transaksi operasional emiten terhadap entitas induk atau grup afiliasinya.
                </p>
            </div>

            {/* Alert */}
            {isHighExposure ? (
                <div className="flex gap-3 p-4 rounded-xl bg-copper-500/[0.06] ring-1 ring-copper-500/15">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-copper-300 flex-shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-copper-300/80">
                        <span className="font-bold text-copper-300 uppercase tracking-wide text-[10px] block mb-1">
                            Eksposur Transaksi Afiliasi Tinggi
                        </span>
                        Emiten memiliki tingkat transaksi dengan pihak berelasi sebesar <strong className="text-copper-300">{details.percentage}%</strong> (di atas ambang batas wajar 20%).
                        Hal ini menunjukkan ketergantungan operasional yang tinggi pada grup atau induk usaha, yang dapat menimbulkan risiko konflik kepentingan atau transfer pricing.
                    </div>
                </div>
            ) : (
                <div className="flex gap-3 p-4 rounded-xl bg-emerald-500/[0.06] ring-1 ring-emerald-500/15">
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-emerald-300/80">
                        <span className="font-bold text-emerald-400 uppercase tracking-wide text-[10px] block mb-1">
                            Eksposur Transaksi Afiliasi Rendah
                        </span>
                        Transaksi dengan pihak berelasi tercatat sebesar <strong className="text-emerald-300">{details.percentage}%</strong> (di bawah 20%).
                        Operasional perusahaan dinilai mandiri dan minim ketergantungan transaksi langsung pada pihak afiliasi grup.
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Persentase */}
                <div className="lg:col-span-1">
                    <Card className="flex flex-col items-center justify-center py-10 text-center h-full">
                        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3 ring-1 ring-white/10">
                            <TbUsers className={`w-6 h-6 ${isHighExposure ? 'text-copper-300' : 'text-emerald-400'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-cream-400/70 uppercase tracking-widest mb-2 block">
                            Persentase Transaksi
                        </span>
                        <span className={`text-5xl font-black ${isHighExposure ? 'text-copper-300' : 'text-emerald-400'}`}>
                            {details.percentage}%
                        </span>
                        <p className="text-[10px] text-cream-400/50 mt-4 max-w-[160px] leading-relaxed">
                            Dari total beban usaha atau pendapatan kumulatif tahun terakhir.
                        </p>
                    </Card>
                </div>

                {/* Detail */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <h4 className="font-bold text-sm text-cream-100 mb-3 pb-3 border-b border-white/10">
                            Detail Ketergantungan Afiliasi
                        </h4>
                        <p className="text-xs text-cream-400 leading-relaxed">
                            {details.details}
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
