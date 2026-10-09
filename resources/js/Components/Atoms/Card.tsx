import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'ghost';
    /** When true, renders content directly in the inner core (no extra padding). */
    flush?: boolean;
}

export default function Card({
    children,
    className = '',
    variant = 'default',
    flush = false,
    ...props
}: CardProps) {
    const shell: Record<NonNullable<CardProps['variant']>, string> = {
        default: 'border-white/10 bg-white/5',
        elevated: 'border-white/10 bg-white/[0.07]',
        ghost: 'border-white/5 bg-transparent',
    };

    const core: Record<NonNullable<CardProps['variant']>, string> = {
        default: 'bg-ink-900/80',
        elevated: 'bg-ink-800/80',
        ghost: 'bg-transparent',
    };

    return (
        <div
            className={`rounded-squircle border p-1.5 ${shell[variant]} ${className}`}
            {...props}
        >
            <div
                className={`h-full rounded-[calc(2rem-0.375rem)] shadow-inset_hi ${core[variant]} ${
                    flush ? '' : 'p-5'
                }`}
            >
                {children}
            </div>
        </div>
    );
}
