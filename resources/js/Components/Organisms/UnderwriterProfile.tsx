import React from 'react';
import Card from '../Atoms/Card';
import Badge from '../Atoms/Badge';
import type { Underwriter, UnderwriterHistoryGroup } from '../../types';

interface UnderwriterProfileProps {
    underwriters: Underwriter[];
    histories?: UnderwriterHistoryGroup[];
}

const returnValue = (value: number | null) => {
    if (value === null) return <span className="text-cream-400/50">Belum tersedia</span>;
    return (
        <span className={value >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {value > 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
    );
};

export default function UnderwriterProfile({ underwriters, histories = [] }: UnderwriterProfileProps) {
    const leadUnderwriters = underwriters.filter(uw => uw.role === 'lead');
    const otherUnderwriters = underwriters.filter(uw => uw.role !== 'lead');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-cream-50 mb-1">Profil Underwriter</h3>
                <p className="text-xs text-cream-400/70">
                    Daftar penjamin pelaksana emisi dan perannya pada penawaran saham ini.
                </p>
            </div>

            {/* Lead Underwriters */}
            <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-cream-400/70 uppercase tracking-widest">
                    Penjamin Pelaksana Emisi Efek (Lead)
                </h4>
                {leadUnderwriters.map((uw) => (
                    <div key={uw.id} className="bg-ink-900 rounded-xl ring-1 ring-white/10 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl font-black text-cream-50">{uw.code}</span>
                                    <Badge variant="emerald">Lead Underwriter</Badge>
                                </div>
                                <span className="text-xs text-cream-400/70 mt-0.5 block">{uw.name}</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Other Underwriters */}
            {otherUnderwriters.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-cream-400/70 uppercase tracking-widest">
                        Penjamin Emisi Lainnya
                    </h4>
                    <Card>
                        <div className="divide-y divide-white/5">
                            {otherUnderwriters.map((uw) => (
                                <div key={uw.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                    <div>
                                        <span className="font-bold text-sm text-cream-100 mr-2">{uw.code}</span>
                                        <span className="text-xs text-cream-400/70">{uw.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={uw.role === 'co-lead' ? 'cyan' : 'neutral'}>
                                            {uw.role === 'co-lead' ? 'Co-Lead' : 'Member'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            <div className="space-y-4 pt-2">
                <div>
                    <h4 className="text-sm font-bold text-cream-100">Saham IPO dari Underwriter yang Sama</h4>
                    <p className="text-[11px] text-cream-400/70 mt-1">
                        Maksimal enam IPO per underwriter. Return dihitung terhadap harga IPO pada hari perdagangan pertama
                        yang tersedia setelah hari ke-30 dan ke-90.
                    </p>
                </div>

                {histories.map((group) => (
                    <Card key={group.underwriter.code}>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                            <div>
                                <span className="font-black text-cream-50">{group.underwriter.code}</span>
                                <span className="text-xs text-cream-400/70 ml-2">{group.underwriter.name}</span>
                            </div>
                            <Badge variant={group.underwriter.role === 'lead' ? 'emerald' : 'neutral'}>
                                {group.underwriter.role}
                            </Badge>
                        </div>

                        {group.ipos.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="text-[10px] uppercase tracking-wide text-cream-400/70">
                                            <th className="py-2 pr-4 text-left">Emiten</th>
                                            <th className="py-2 px-4 text-right">Harga IPO</th>
                                            <th className="py-2 px-4 text-center">Status</th>
                                            <th className="py-2 px-4 text-right">Return 30H+</th>
                                            <th className="py-2 pl-4 text-right">Return 90H+</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {group.ipos.map((item) => (
                                            <tr key={`${group.underwriter.code}-${item.code}`}>
                                                <td className="py-3 pr-4">
                                                    {item.source_url ? (
                                                        <a href={item.source_url} target="_blank" rel="noreferrer" className="font-bold text-cyan-400 hover:text-cyan-300">
                                                            {item.code}
                                                        </a>
                                                    ) : (
                                                        <span className="font-bold text-cream-100">{item.code}</span>
                                                    )}
                                                    <span className="block text-[10px] text-cream-400/70">{item.company_name}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-cream-200">
                                                    Rp{new Intl.NumberFormat('id-ID').format(item.ipo_price)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge variant={item.status === 'listed' ? 'neutral' : 'copper'}>
                                                        {item.status === 'listed' ? 'Listed' : 'Offering'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">{returnValue(item.return_30d)}</td>
                                                <td className="py-3 pl-4 text-right">{returnValue(item.return_90d)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-cream-400/50 py-4 text-center">Belum ada histori IPO untuk underwriter ini.</p>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
