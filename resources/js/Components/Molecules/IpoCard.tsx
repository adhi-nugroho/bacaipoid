import React from 'react';
import { Link } from '@inertiajs/react';
import { HiOutlineArrowRight, HiOutlineExclamation } from 'react-icons/hi';
import Badge from '../Atoms/Badge';
import type { IpoItem } from '../../types';

interface IpoCardProps {
    ipo: IpoItem;
}

const statusConfig = {
    book_building: { label: 'Book building', variant: 'copper' as const },
    offering: { label: 'Offering', variant: 'emerald' as const },
    listed: { label: 'Listed', variant: 'neutral' as const },
};

export default function IpoCard({ ipo }: IpoCardProps) {
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(ipo.ipo_price);
    const formattedShares = new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(ipo.offering_shares);

    const stats = [
        { label: 'Harga IPO', value: formattedPrice },
        { label: 'Saham ditawarkan', value: `${formattedShares} lembar` },
        ...(ipo.dilution_percentage !== undefined
            ? [{ label: 'Dilusi', value: `${ipo.dilution_percentage}%` }]
            : []),
        ...(ipo.listing_date
            ? [{ label: 'Pencatatan', value: ipo.listing_date }]
            : []),
    ];

    return (
        <article className="group h-full rounded-squircle border border-white/10 bg-white/5 p-1.5 transition-all duration-700 ease-silk hover:border-white/20">
            <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] border border-white/5 bg-ink-900/80 shadow-inset_hi">
                <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-mono text-3xl font-semibold tracking-[-0.04em] text-cream-50">
                                {ipo.code}
                            </p>
                            <h3 className="mt-2 line-clamp-2 text-sm leading-5 text-cream-400">
                                {ipo.company_name}
                            </h3>
                        </div>
                        <Badge variant={statusConfig[ipo.status].variant}>
                            {statusConfig[ipo.status].label}
                        </Badge>
                    </div>

                    <p className="mt-6 inline-flex w-max max-w-full truncate rounded-full bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-cream-400/80">
                        {ipo.sector}
                    </p>

                    <dl className="mt-6 grid grid-cols-2 gap-2.5">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-inset ring-white/[0.04]"
                            >
                                <dt className="text-[11px] text-cream-400/70">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 text-sm font-semibold tabular-nums text-cream-100">
                                    {stat.value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {ipo.has_secondary_offering && (
                        <div className="mt-6 flex gap-2.5 rounded-2xl bg-copper-500/[0.07] px-4 py-3 ring-1 ring-inset ring-copper-500/20">
                            <HiOutlineExclamation className="mt-0.5 h-4 w-4 shrink-0 text-copper-400" />
                            <p className="text-xs leading-5 text-copper-300/80">
                                Penawaran mencakup saham milik pemegang saham
                                lama.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0">
                    <Link
                        href={route('ipo.show', ipo.code)}
                        className="group/cta flex items-center justify-between rounded-full bg-copper-600 py-2 pl-6 pr-2 text-sm font-semibold text-ink-950 transition-all duration-700 ease-silk hover:bg-copper-400 active:scale-[0.98]"
                    >
                        Buka ringkasan
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/15 transition-all duration-700 ease-silk group-hover/cta:translate-x-1 group-hover/cta:-translate-y-px group-hover/cta:scale-105">
                            <HiOutlineArrowRight className="h-4 w-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
}
