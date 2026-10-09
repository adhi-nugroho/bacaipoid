import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { HiOutlineArrowRight } from 'react-icons/hi';

const LINKS = [
    { label: 'Katalog IPO', href: route('home'), match: '/' },
    { label: 'Cara data disajikan', href: '#cara-data', match: '#cara-data' },
];

export default function Navbar() {
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
                <div className="mt-6 w-max max-w-[calc(100vw-2rem)] rounded-full border border-white/10 bg-ink-900/70 p-1.5 shadow-ambient backdrop-blur-2xl">
                    <nav
                        aria-label="Navigasi utama"
                        className="flex items-center gap-1.5"
                    >
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 transition-all duration-500 ease-silk hover:bg-white/5"
                            aria-label="MariBacaIPO — halaman utama"
                        >
                            <img
                                src="/image/logo.png"
                                alt=""
                                className="h-7 w-7 object-contain"
                            />
                            <span className="text-sm font-semibold tracking-tight text-cream-50">
                                MariBacaIPO
                            </span>
                        </Link>

                        <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />

                        <Link
                            href={route('home')}
                            className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ease-silk sm:block ${
                                url === '/'
                                    ? 'bg-white/10 text-copper-300'
                                    : 'text-cream-400 hover:bg-white/5 hover:text-cream-100'
                            }`}
                        >
                            Katalog IPO
                        </Link>

                        <a
                            href="#cara-data"
                            className="hidden rounded-full px-4 py-2 text-sm font-medium text-cream-400 transition-all duration-500 ease-silk hover:bg-white/5 hover:text-cream-100 sm:block"
                        >
                            Cara data disajikan
                        </a>

                        <button
                            type="button"
                            onClick={() => setOpen((value) => !value)}
                            aria-label={open ? 'Tutup menu' : 'Buka menu'}
                            aria-expanded={open}
                            className="relative ml-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all duration-500 ease-silk hover:bg-white/10 active:scale-[0.94] sm:hidden"
                        >
                            <span className="sr-only">Menu</span>
                            <span
                                className={`absolute h-px w-4 bg-cream-100 transition-all duration-500 ease-silk ${
                                    open
                                        ? 'translate-y-0 rotate-45'
                                        : '-translate-y-1.5'
                                }`}
                            />
                            <span
                                className={`absolute h-px w-4 bg-cream-100 transition-all duration-500 ease-silk ${
                                    open
                                        ? 'translate-y-0 -rotate-45'
                                        : 'translate-y-1.5'
                                }`}
                            />
                        </button>
                    </nav>
                </div>
            </header>

            <div
                aria-hidden={!open}
                className={`fixed inset-0 z-40 backdrop-blur-3xl transition-opacity duration-700 ease-silk sm:hidden ${
                    open
                        ? 'pointer-events-auto bg-ink-950/80 opacity-100'
                        : 'pointer-events-none opacity-0'
                }`}
                onClick={() => setOpen(false)}
            >
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6">
                    {LINKS.map((link, index) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            style={{
                                transitionDelay: open
                                    ? `${120 + index * 70}ms`
                                    : '0ms',
                            }}
                            className={`group flex items-center gap-4 py-3 text-center font-display text-4xl text-cream-100 transition-all duration-700 ease-silk sm:text-5xl ${
                                open
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-12 opacity-0'
                            }`}
                        >
                            {link.label}
                            <HiOutlineArrowRight className="h-6 w-6 shrink-0 text-copper-400 opacity-0 transition-all duration-500 ease-silk group-hover:translate-x-1 group-hover:opacity-100" />
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}
