import React from 'react';
import Card from '../Atoms/Card';
import {
    HiOutlineExclamationCircle,
    HiOutlineCheckCircle,
    HiOutlineLockClosed,
    HiOutlineLockOpen,
} from 'react-icons/hi';
import { TbArrowBarDown, TbArrowBarUp, TbMinus } from 'react-icons/tb';
import type { IpoDetailsForOwnership } from '../../types';

interface OwnershipStructureTableProps {
    details: IpoDetailsForOwnership;
}

export default function OwnershipStructureTable({ details }: OwnershipStructureTableProps) {
    const isPotentialExitLiquidity =
        (details.dilution_percentage > 25 || details.has_secondary_offering) &&
        !details.has_extra_lockup;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Struktur Kepemilikan & Sinyal Exit Liquidity</h3>
                <p className="text-xs text-cream-400/70">
                    Analisis perubahan kepemilikan saham lama vs pemegang saham baru, serta durasi kewajiban lock-up.
                </p>
            </div>

            {/* Exit Liquidity Alert */}
            {isPotentialExitLiquidity ? (
                <div className="flex gap-3 p-4 rounded-xl bg-copper-500/[0.06] ring-1 ring-copper-500/15">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-copper-300 flex-shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-copper-300/80">
                        <span className="font-bold text-copper-300 uppercase tracking-wide text-[10px] block mb-1.5">
                            Peringatan: Potensi Sinyal Exit Liquidity
                        </span>
                        <ul className="space-y-1 text-[11px]">
                            {details.has_secondary_offering && (
                                <li>· Terdapat penawaran sekunder (saham milik pemegang lama dilepas ke publik saat IPO).</li>
                            )}
                            {details.dilution_percentage > 25 && (
                                <li>· Persentase dilusi kepemilikan baru relatif besar ({details.dilution_percentage}%).</li>
                            )}
                            <li>· Tidak terdeteksi komitmen lock-up sukarela tambahan di luar regulasi minimum OJK.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3 p-4 rounded-xl bg-emerald-500/[0.06] ring-1 ring-emerald-500/15">
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-emerald-300/80">
                        <span className="font-bold text-emerald-400 uppercase tracking-wide text-[10px] block mb-1">
                            Struktur Kepemilikan Stabil
                        </span>
                        {details.has_extra_lockup ? (
                            <span>
                                Prospektus mencantumkan <strong className="text-emerald-300">lock-up sukarela tambahan</strong> ({details.lockup_details}).
                            </span>
                        ) : (
                            <span>Tidak terdeteksi penawaran divestasi saham lama secara masif (secondary offering) pada saat IPO.</span>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shareholders Table */}
                <div className="lg:col-span-2">
                    <Card>
                        <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10">
                            Pemegang Saham Utama (Sebelum vs Sesudah IPO)
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-xs">
                                <thead>
                                    <tr>
                                        <th className="py-2 pr-4 text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">Nama Pemegang Saham</th>
                                        <th className="py-2 px-4 text-right text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">Sebelum IPO</th>
                                        <th className="py-2 px-4 text-right text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">Sesudah IPO</th>
                                        <th className="py-2 pl-4 text-right text-[10px] font-bold text-cream-400/70 uppercase tracking-wide">Perubahan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {details.shareholders.map((sh, idx) => {
                                        const change = sh.after_percentage - sh.before_percentage;
                                        return (
                                            <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-3 pr-4 font-semibold text-cream-100">{sh.name}</td>
                                                <td className="py-3 px-4 text-right text-cream-400">{sh.before_percentage.toFixed(2)}%</td>
                                                <td className="py-3 px-4 text-right font-semibold text-cream-100">{sh.after_percentage.toFixed(2)}%</td>
                                                <td className="py-3 pl-4 text-right">
                                                    <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                                                        change < 0 ? 'text-rose-400' : change > 0 ? 'text-emerald-400' : 'text-cream-400/70'
                                                    }`}>
                                                        {change < 0
                                                            ? <TbArrowBarDown className="w-3.5 h-3.5" />
                                                            : change > 0
                                                                ? <TbArrowBarUp className="w-3.5 h-3.5" />
                                                                : <TbMinus className="w-3.5 h-3.5" />}
                                                        {change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Lockup Info */}
                <div className="space-y-4">
                    <Card>
                        <h4 className="font-bold text-sm text-cream-100 mb-4 pb-3 border-b border-white/10">
                            Ketentuan Lock-Up & Divestasi
                        </h4>
                        <div className="space-y-4 text-xs">
                            <div>
                                <span className="text-[10px] text-cream-400/70 uppercase tracking-wide block mb-1.5">
                                    Status Saham Ditawarkan
                                </span>
                                <span className={`font-bold text-sm ${details.has_secondary_offering ? 'text-copper-300' : 'text-cream-100'}`}>
                                    {details.has_secondary_offering
                                        ? 'Campuran (Baru + Lama Existing)'
                                        : 'Saham Baru Murni (Primary Offering)'}
                                </span>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <span className="text-[10px] text-cream-400/70 uppercase tracking-wide block mb-1.5">
                                    Komitmen Lock-up Pengendali
                                </span>
                                <div className="flex items-center gap-1.5 mb-2">
                                    {details.has_extra_lockup
                                        ? <HiOutlineLockClosed className="w-4 h-4 text-emerald-400" />
                                        : <HiOutlineLockOpen className="w-4 h-4 text-cream-400/70" />}
                                    <span className={`font-bold text-sm ${details.has_extra_lockup ? 'text-emerald-400' : 'text-cream-400'}`}>
                                        {details.has_extra_lockup ? 'Ada Lock-up Tambahan' : 'Hanya Lock-up Regulasi Minimum'}
                                    </span>
                                </div>
                                {details.lockup_details && (
                                    <p className="text-cream-400/70 leading-relaxed text-[11px]">
                                        {details.lockup_details}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
