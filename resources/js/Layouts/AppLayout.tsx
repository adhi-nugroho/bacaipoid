import React from 'react';
import Navbar from '../Components/Organisms/Navbar';
import Footer from '../Components/Organisms/Footer';
import useSmoothScroll from '../Hooks/useSmoothScroll';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    useSmoothScroll();

    return (
        <div className="grain-overlay relative flex min-h-[100dvh] flex-col overflow-x-clip bg-ink-950 font-sans text-cream-100 antialiased">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background:
                        'radial-gradient(60% 45% at 18% 0%, rgba(194,112,58,0.10), transparent 70%), radial-gradient(50% 40% at 100% 12%, rgba(227,168,122,0.07), transparent 70%)',
                }}
            />
            <div className="relative z-10 flex min-h-[100dvh] flex-col">
                <Navbar />
                <main className="mx-auto w-full max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
