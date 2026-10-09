import { useEffect } from 'react';
import Lenis from 'lenis';

export default function useSmoothScroll() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            wheelMultiplier: 0.9,
        });

        let frame = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(frame);
            lenis.destroy();
        };
    }, []);
}
