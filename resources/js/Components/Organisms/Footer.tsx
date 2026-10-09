import React from 'react';
import { HiOutlineArrowRight } from 'react-icons/hi';
import Reveal from '../Atoms/Reveal';

const COLUMNS = [
    {
        title: 'Sumber utama',
        items: [
            'Prospektus pada e-IPO',
            'Keterbukaan informasi IDX',
            'Laporan emiten jika tersedia',
        ],
    },
    {
        title: 'Batasan',
        items: [
            'Bukan rekomendasi investasi',
            'Data dapat terlambat atau tidak lengkap',
            'Dokumen resmi tetap menjadi rujukan utama',
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative z-10 mt-32 px-4 pb-10 sm:px-6 lg:px-8">
            <Reveal className="mx-auto w-full max-w-7xl">
                <div className="rounded-squircle border border-white/10 bg-white/5 p-1.5">
                    <div className="rounded-[calc(2rem-0.375rem)] border border-white/5 bg-ink-900/80 px-6 py-14 shadow-inset_hi sm:px-10 lg:px-14">
                        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
                            <div>
                                <p className="font-display text-3xl leading-none text-cream-50">
                                    MariBacaIPO
                                </p>
                                <p className="mt-5 max-w-md text-sm leading-6 text-cream-400">
                                    Katalog independen yang menyusun informasi
                                    dari prospektus IPO dan dokumen publik.
                                    MariBacaIPO tidak terafiliasi dengan e-IPO,
                                    IDX, OJK, atau emiten yang ditampilkan.
                                </p>
                            </div>

                            {COLUMNS.map((column) => (
                                <div key={column.title}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-400">
                                        {column.title}
                                    </p>
                                    <ul className="mt-5 space-y-3 text-sm text-cream-400">
                                        {column.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-14 flex flex-col gap-4 border-t border-white/5 pt-8 text-xs text-cream-400/70 sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                © {new Date().getFullYear()} MariBacaIPO
                            </span>
                            <a
                                href="https://adhin.my.id/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 transition-colors duration-500 ease-silk hover:text-cream-100"
                            >
                                Pengelola situs
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 transition-transform duration-500 ease-silk group-hover:translate-x-0.5 group-hover:-translate-y-px">
                                    <HiOutlineArrowRight className="h-3 w-3" />
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>
        </footer>
    );
}
