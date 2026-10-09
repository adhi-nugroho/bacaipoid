import React, { useMemo } from 'react';
import { HiOutlineAdjustments, HiOutlineSearch } from 'react-icons/hi';
import AppLayout from '../Layouts/AppLayout';
import IpoCard from '../Components/Molecules/IpoCard';
import SeoMeta from '../Components/Atoms/SeoMeta';
import Reveal from '../Components/Atoms/Reveal';
import { useCatalogStore } from '../stores';
import type { IpoItem } from '../types';

interface WelcomeProps {
    ipos?: IpoItem[];
}

const COVERAGE = [
    {
        title: 'Penggunaan dana',
        description:
            'Rincian rencana alokasi dana berdasarkan kategori yang tercantum dalam prospektus.',
    },
    {
        title: 'Kinerja keuangan',
        description:
            'Ringkasan laba rugi, posisi keuangan, dan rasio yang tersedia pada dokumen sumber.',
    },
    {
        title: 'Risiko dan kepemilikan',
        description:
            'Risiko yang diungkapkan emiten, struktur pemegang saham, dan potensi dilusi.',
    },
    {
        title: 'Penjamin emisi',
        description:
            'Informasi underwriter dan riwayat penawaran sebelumnya jika datanya tersedia.',
    },
];

const PROCESS = [
    [
        '01',
        'Mengambil dokumen publik',
        'Sumber utama berasal dari prospektus e-IPO dan keterbukaan informasi IDX.',
    ],
    [
        '02',
        'Menyusun data',
        'Bagian yang relevan disusun menjadi informasi terstruktur agar lebih mudah ditinjau.',
    ],
    [
        '03',
        'Menampilkan sumber dan batasan',
        'Setiap ringkasan tetap perlu dibandingkan dengan dokumen resmi sebelum digunakan.',
    ],
];

export default function Welcome({ ipos = [] }: WelcomeProps) {
    const { searchQuery, selectedStatus, setSearchQuery, setSelectedStatus } =
        useCatalogStore();

    const filteredIpos = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return ipos.filter((ipo) => {
            const matchesSearch =
                !query ||
                [ipo.code, ipo.company_name, ipo.sector].some((value) =>
                    value.toLowerCase().includes(query),
                );
            const matchesStatus =
                selectedStatus === 'all' || ipo.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [ipos, searchQuery, selectedStatus]);

    const statusCounts = useMemo(
        () => ({
            bookBuilding: ipos.filter((ipo) => ipo.status === 'book_building')
                .length,
            offering: ipos.filter((ipo) => ipo.status === 'offering').length,
            listed: ipos.filter((ipo) => ipo.status === 'listed').length,
        }),
        [ipos],
    );

    return (
        <AppLayout>
            <SeoMeta
                title="Informasi IPO Indonesia | MariBacaIPO"
                description="Katalog ringkasan informasi IPO Indonesia berdasarkan prospektus publik dari e-IPO dan IDX."
                canonical={route('home')}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'MariBacaIPO',
                    url: route('home'),
                    description:
                        'Katalog ringkasan informasi IPO Indonesia dari dokumen publik.',
                }}
            />

            {/* Hero — Editorial Split */}
            <section className="grid gap-16 pb-24 pt-40 sm:pt-48 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-20 lg:pb-32">
                <Reveal>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-300">
                        Prospektus, disusun ulang
                    </span>
                    <h1 className="mt-8 font-display text-5xl leading-[0.98] tracking-[-0.02em] text-cream-50 text-balance sm:text-6xl lg:text-[5.25rem]">
                        Membaca IPO
                        <span className="block italic text-copper-300">
                            tanpa harus jadi analis.
                        </span>
                    </h1>
                    <p className="mt-8 max-w-xl text-base leading-7 text-cream-400">
                        MariBacaIPO menyusun data dari prospektus publik
                        menjadi ringkasan yang bisa ditinjau cepat. Gunakan
                        sebagai titik awal, lalu periksa dokumen resmi sebelum
                        mengambil keputusan.
                    </p>
                    <p className="mt-8 max-w-lg rounded-2xl bg-white/[0.03] px-5 py-4 text-sm leading-6 text-cream-400 ring-1 ring-inset ring-white/[0.06]">
                        <span className="font-semibold text-copper-400">
                            Bukan rekomendasi beli atau jual.
                        </span>{' '}
                        MariBacaIPO hanya membantu menjelaskan cara membaca
                        informasi dalam prospektus.
                    </p>
                </Reveal>

                {/* Asymmetric stat cluster */}
                <Reveal delay={140} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 rounded-squircle border border-white/10 bg-white/5 p-1.5">
                        <div className="rounded-[calc(2rem-0.375rem)] bg-ink-900/80 px-6 py-7 shadow-inset_hi">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-400/70">
                                Sedang berlangsung
                            </p>
                            <div className="mt-5 flex items-end gap-6">
                                <div>
                                    <p className="font-mono text-5xl font-semibold tabular-nums text-cream-50">
                                        {statusCounts.bookBuilding +
                                            statusCounts.offering}
                                    </p>
                                    <p className="mt-2 text-xs text-cream-400/70">
                                        emiten aktif
                                    </p>
                                </div>
                                <div className="pb-1">
                                    <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-400">
                                        {statusCounts.offering}
                                    </p>
                                    <p className="mt-2 text-xs text-cream-400/70">
                                        offering
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-squircle border border-white/10 bg-white/5 p-1.5">
                        <div className="rounded-[calc(2rem-0.375rem)] bg-ink-900/80 px-5 py-6 shadow-inset_hi">
                            <p className="font-mono text-3xl font-semibold tabular-nums text-copper-300">
                                {statusCounts.bookBuilding}
                            </p>
                            <p className="mt-2 text-xs text-cream-400/70">
                                book building
                            </p>
                        </div>
                    </div>
                    <div className="rounded-squircle border border-white/10 bg-white/5 p-1.5">
                        <div className="rounded-[calc(2rem-0.375rem)] bg-ink-900/80 px-5 py-6 shadow-inset_hi">
                            <p className="font-mono text-3xl font-semibold tabular-nums text-cream-300">
                                {statusCounts.listed}
                            </p>
                            <p className="mt-2 text-xs text-cream-400/70">
                                sudah tercatat
                            </p>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Catalog */}
            <section className="pb-24 sm:pb-32" aria-labelledby="catalog-title">
                <Reveal className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-400">
                            Katalog
                        </span>
                        <h2
                            id="catalog-title"
                            className="mt-4 font-display text-4xl tracking-[-0.01em] text-cream-50 sm:text-5xl"
                        >
                            IPO dalam proses
                        </h2>
                        <p className="mt-4 text-sm text-cream-400">
                            {statusCounts.bookBuilding} book building dan{' '}
                            {statusCounts.offering} offering tersedia saat ini.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 rounded-full border border-white/10 bg-white/[0.03] p-2 backdrop-blur-none sm:flex-row">
                        <label className="relative block sm:w-80">
                            <span className="sr-only">Cari emiten</span>
                            <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-400/60" />
                            <input
                                type="search"
                                placeholder="Kode, nama emiten, atau sektor"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                className="w-full rounded-full border-0 bg-ink-900 py-2.5 pl-11 pr-4 text-sm text-cream-100 placeholder:text-cream-400/50 focus:ring-1 focus:ring-copper-500/50"
                            />
                        </label>

                        <label className="relative block">
                            <span className="sr-only">Filter status</span>
                            <HiOutlineAdjustments className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-400/60" />
                            <select
                                value={selectedStatus}
                                onChange={(event) =>
                                    setSelectedStatus(event.target.value)
                                }
                                className="w-full appearance-none rounded-full border-0 bg-ink-900 py-2.5 pl-11 pr-10 text-sm text-cream-300 focus:ring-1 focus:ring-copper-500/50 sm:w-48"
                            >
                                <option value="all">Semua status</option>
                                <option value="book_building">
                                    Book building
                                </option>
                                <option value="offering">Offering</option>
                            </select>
                        </label>
                    </div>
                </Reveal>

                {filteredIpos.length > 0 ? (
                    <>
                        <p
                            className="mb-6 text-xs text-cream-400/60"
                            aria-live="polite"
                        >
                            Menampilkan {filteredIpos.length} dari {ipos.length}{' '}
                            emiten
                        </p>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredIpos.map((ipo, index) => (
                                <Reveal
                                    key={ipo.id}
                                    as="div"
                                    delay={(index % 3) * 90}
                                    className="h-full"
                                >
                                    <IpoCard ipo={ipo} />
                                </Reveal>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-squircle border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
                        <h3 className="font-display text-2xl text-cream-200">
                            {ipos.length === 0
                                ? 'Belum ada IPO aktif'
                                : 'Tidak ada emiten yang sesuai'}
                        </h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-cream-400/70">
                            {ipos.length === 0
                                ? 'Data akan tampil setelah tersedia dan berhasil diproses dari sumber publik.'
                                : 'Coba ubah kata pencarian atau pilih status yang berbeda.'}
                        </p>
                    </div>
                )}
            </section>

            {/* Coverage — Asymmetric Bento */}
            <section
                className="border-t border-white/5 py-24 sm:py-32"
                aria-labelledby="coverage-title"
            >
                <Reveal className="mb-16 max-w-2xl">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-400">
                        Cakupan informasi
                    </span>
                    <h2
                        id="coverage-title"
                        className="mt-4 font-display text-4xl tracking-[-0.01em] text-cream-50 sm:text-5xl"
                    >
                        Bagian yang diringkas
                    </h2>
                    <p className="mt-5 text-sm leading-6 text-cream-400">
                        Kelengkapan setiap emiten bergantung pada isi dan
                        kualitas dokumen yang tersedia.
                    </p>
                </Reveal>

                <div className="grid gap-6 lg:grid-cols-2">
                    {COVERAGE.map((item, index) => (
                        <Reveal
                            key={item.title}
                            delay={(index % 2) * 110}
                            className={`h-full ${
                                index === 0 ? 'lg:pr-6' : ''
                            }`}
                        >
                            <div className="h-full rounded-squircle border border-white/10 bg-white/5 p-1.5">
                                <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] border border-white/5 bg-ink-900/80 p-8 shadow-inset_hi">
                                    <span className="font-mono text-xs text-copper-500">
                                        0{index + 1}
                                    </span>
                                    <h3 className="mt-6 text-lg font-semibold text-cream-100">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-cream-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Process */}
            <section
                id="cara-data"
                className="pb-32 scroll-mt-28"
                aria-labelledby="process-title"
            >
                <Reveal className="mb-16">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-400">
                        Metodologi
                    </span>
                    <h2
                        id="process-title"
                        className="mt-4 font-display text-4xl tracking-[-0.01em] text-cream-50 sm:text-5xl"
                    >
                        Cara data disajikan
                    </h2>
                </Reveal>

                <ol className="grid gap-px overflow-hidden rounded-squircle border border-white/10 bg-white/5 md:grid-cols-3">
                    {PROCESS.map(([number, title, description], index) => (
                        <Reveal
                            key={number}
                            as="li"
                            delay={index * 120}
                            className="bg-ink-900/80 p-8 sm:p-10"
                        >
                            <span className="font-mono text-xs text-copper-500">
                                {number}
                            </span>
                            <h3 className="mt-8 text-base font-semibold text-cream-100">
                                {title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-cream-400">
                                {description}
                            </p>
                        </Reveal>
                    ))}
                </ol>
            </section>
        </AppLayout>
    );
}
