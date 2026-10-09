import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    as?: 'div' | 'section' | 'li' | 'article';
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Reveal({
    children,
    delay = 0,
    className = '',
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (prefersReducedMotion()) {
            setVisible(true);
            return;
        }

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref as never}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transform-gpu transition-all duration-[900ms] ease-silk ${
                visible
                    ? 'translate-y-0 opacity-100 blur-0'
                    : 'translate-y-16 opacity-0 blur-md'
            } ${className}`}
        >
            {children}
        </Tag>
    );
}
