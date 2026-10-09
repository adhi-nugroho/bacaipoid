import React from 'react';
import { HiOutlineExclamationCircle, HiOutlineShieldCheck } from 'react-icons/hi';
import { TbAlertTriangle, TbActivity } from 'react-icons/tb';
import type { IpoRisk } from '../../types';

interface RiskAnalysisSectionProps {
    risks: IpoRisk[];
}

export default function RiskAnalysisSection({ risks }: RiskAnalysisSectionProps) {
    const specificRisks = risks.filter(r => r.type === 'specific');
    const genericRisks  = risks.filter(r => r.type === 'generic');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Identifikasi Risiko Utama</h3>
                <p className="text-xs text-cream-400/70">
                    Daftar risiko penting yang dipetakan antara risiko operasional bisnis utama vs risiko makro ekonomi secara umum.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risiko Spesifik */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <TbAlertTriangle className="w-4 h-4 text-rose-400" />
                        <h4 className="font-bold text-sm text-cream-100">Risiko Spesifik Operasional & Bisnis</h4>
                        <span className="ml-auto text-[10px] font-bold text-rose-400 bg-rose-500/10 ring-1 ring-rose-500/20 rounded-full px-2 py-0.5">
                            {specificRisks.length} item
                        </span>
                    </div>
                    {specificRisks.length > 0 ? (
                        <div className="space-y-2.5">
                            {specificRisks.map((risk) => (
                                <div key={risk.id} className="bg-ink-900 rounded-xl ring-1 ring-rose-500/10 overflow-hidden border-l-2 border-l-rose-500/50">
                                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-rose-500/[0.03]">
                                        <h5 className="font-bold text-xs text-rose-300 leading-snug">{risk.title}</h5>
                                    </div>
                                    <p className="px-4 py-3 text-[11px] text-cream-400 leading-relaxed">
                                        {risk.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-8 justify-center">
                            <HiOutlineShieldCheck className="w-5 h-5 text-cream-400/50" />
                            <p className="text-xs text-cream-400/50 italic">Tidak ada data risiko spesifik terdeteksi.</p>
                        </div>
                    )}
                </div>

                {/* Risiko Generik */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <TbActivity className="w-4 h-4 text-copper-300" />
                        <h4 className="font-bold text-sm text-cream-100">Risiko Makro, Regulasi, & Hukum</h4>
                        <span className="ml-auto text-[10px] font-bold text-copper-300 bg-copper-500/10 ring-1 ring-copper-500/20 rounded-full px-2 py-0.5">
                            {genericRisks.length} item
                        </span>
                    </div>
                    {genericRisks.length > 0 ? (
                        <div className="space-y-2.5">
                            {genericRisks.map((risk) => (
                                <div key={risk.id} className="bg-ink-900 rounded-xl ring-1 ring-copper-500/10 overflow-hidden border-l-2 border-l-copper-500/50">
                                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-copper-500/[0.03]">
                                        <h5 className="font-bold text-xs text-copper-300 leading-snug">{risk.title}</h5>
                                    </div>
                                    <p className="px-4 py-3 text-[11px] text-cream-400 leading-relaxed">
                                        {risk.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-8 justify-center">
                            <HiOutlineExclamationCircle className="w-5 h-5 text-cream-400/50" />
                            <p className="text-xs text-cream-400/50 italic">Tidak ada data risiko generik terdeteksi.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
