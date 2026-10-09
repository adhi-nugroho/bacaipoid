import React from 'react';
import Badge from '../Atoms/Badge';

interface FinancialRatioItemProps {
    name: string;
    value: string | number;
    description: string;
    status?: 'good' | 'warning' | 'danger' | 'neutral';
    statusLabel?: string;
}

const valueColors = {
    good:    'text-emerald-400',
    warning: 'text-copper-300',
    danger:  'text-rose-400',
    neutral: 'text-cream-100',
};

const statusVariants = {
    good:    'emerald' as const,
    warning: 'copper' as const,
    danger:  'danger' as const,
    neutral: 'neutral' as const,
};

export default function FinancialRatioItem({
    name,
    value,
    description,
    status = 'neutral',
    statusLabel,
}: FinancialRatioItemProps) {
    return (
        <div className="flex flex-col p-4 bg-ink-900 rounded-xl ring-1 ring-white/10 gap-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-cream-400/70 uppercase tracking-widest">{name}</span>
                {statusLabel && (
                    <Badge variant={statusVariants[status]}>{statusLabel}</Badge>
                )}
            </div>
            <div className={`text-2xl font-black ${valueColors[status]}`}>{value}</div>
            <p className="text-[11px] text-cream-400/70 leading-relaxed">{description}</p>
        </div>
    );
}
