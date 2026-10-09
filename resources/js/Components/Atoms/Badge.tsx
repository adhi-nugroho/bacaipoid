import React from 'react';

type BadgeVariant =
    | 'neutral'
    | 'copper'
    | 'emerald'
    | 'danger'
    | 'muted'
    | 'cyan'
    // Legacy aliases kept so existing callers keep compiling.
    | 'blue'
    | 'amber'
    | 'slate'
    | 'gray'
    | 'rose';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

export default function Badge({
    variant = 'neutral',
    children,
    className = '',
}: BadgeProps) {
    const baseStyles =
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1';

    const variants: Record<BadgeVariant, string> = {
        neutral: 'bg-white/5 text-cream-300 ring-white/10',
        copper: 'bg-copper-500/10 text-copper-300 ring-copper-500/25',
        emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        danger: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
        muted: 'bg-white/[0.03] text-cream-400/80 ring-white/5',
        cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/20',
        // Legacy
        blue: 'bg-white/5 text-cream-300 ring-white/10',
        amber: 'bg-copper-500/10 text-copper-300 ring-copper-500/25',
        slate: 'bg-white/5 text-cream-300 ring-white/10',
        gray: 'bg-white/[0.03] text-cream-400/80 ring-white/5',
        rose: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
