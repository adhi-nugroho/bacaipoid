import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import SeoMeta from '../Components/Atoms/SeoMeta';
import Reveal from '../Components/Atoms/Reveal';
import TabNavigation from '../Components/Molecules/TabNavigation';
import Badge from '../Components/Atoms/Badge';
import { HiOutlineArrowLeft } from 'react-icons/hi';

import ProceedsBreakdown from '../Components/Organisms/ProceedsBreakdown';
import OwnershipStructureTable from '../Components/Organisms/OwnershipStructureTable';
import UnderwriterProfile from '../Components/Organisms/UnderwriterProfile';
import FinancialSummarySection from '../Components/Organisms/FinancialSummarySection';
import RiskAnalysisSection from '../Components/Organisms/RiskAnalysisSection';
import RelatedPartySection from '../Components/Organisms/RelatedPartySection';
import ValuationSection from '../Components/Organisms/ValuationSection';
import type {
    AiValuationResult,
    IpoDetail as IpoDetailData,
    UnderwriterHistoryGroup,
} from '../types';

interface IpoDetailProps {
    ipo?: IpoDetailData;
    underwriter_histories?: UnderwriterHistoryGroup[];
    valuation?: AiValuationResult | { error: string; config_missing?: boolean };
}

const statusConfig = {
    book_building: { label: 'Book Building', variant: 'copper' as const },
    offering: { label: 'Offering', variant: 'emerald' as const },
    listed: { label: 'Listed', variant: 'neutral' as const },
};

const tabs = [
    { id: 'proceeds', label: 'Penggunaan Dana' },
    { id: 'valuation', label: 'Valuasi' },
    { id: 'ownership', label: 'Kepemilikan' },
    { id: 'underwriters', label: 'Underwriter' },
    { id: 'financials', label: 'Keuangan' },
    { id: 'risks', label: 'Risiko' },
    { id: 'related', label: 'Afiliasi' },
];

export default function IpoDetail({ ipo, underwriter_histories, valuation }: IpoDetailProps) {
    const { url } = usePage();
    const [activeTab, setActiveTab] = useState(() => {
        const query = url.split('?')[1] ?? '';
        const requestedTab = new URLSearchParams(query).get('tab');

        return tabs.some((tab) => tab.id === requestedTab) ? requestedTab! : 'proceeds';
    });

    const handleTabChange = (tabId: string) => {
        if (!tabs.some((tab) => tab.id === tabId)) return;

        setActiveTab(tabId);

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('tab', tabId);
        window.history.replaceState(window.history.state, '', nextUrl);
    };

    if (!ipo) {
        return (
            <AppLayout>
                <div className="py-32 text-center">
                    <p className="text-sm text-cream-400">
                        Data IPO tidak ditemukan.
                    </p>
                </div>
            </AppLayout>
        );
    }

    const status = statusConfig[ipo.status];

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
        { label: 'Saham ditawarkan', value: formattedShares },
        { label: 'Pencatatan', value: ipo.listing_date || 'Belum tersedia' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'proceeds': return <ProceedsBreakdown allocations={ipo.allocations} />;
            case 'valuation': return <ValuationSection ipo={ipo} valuation={valuation} />;
            case 'ownership': return <OwnershipStructureTable details={ipo.ownership} />;
            case 'underwriters': return <UnderwriterProfile underwriters={ipo.underwriters} histories={underwriter_histories} />;
            case 'financials': return <FinancialSummarySection details={ipo.financials} />;
            case 'risks': return <RiskAnalysisSection risks={ipo.risks} />;
            case 'related': return <RelatedPartySection details={ipo.related_party} />;
            default: return null;
        }
    };

    return (
        <AppLayout>
            <SeoMeta
                title={`Ringkasan IPO ${ipo.code} - ${ipo.company_name} | MariBacaIPO`}
                description={`Ringkasan prospektus IPO ${ipo.company_name} (${ipo.code}). Harga IPO ${formattedPrice}, sektor ${ipo.sector}, penggunaan dana, risiko, dan data keuangan yang tersedia.`}
                canonical={route('ipo.show', ipo.code)}
                ogType="article"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Katalog IPO',
                            item: route('home'),
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: `${ipo.code} - ${ipo.company_name}`,
                            item: route('ipo.show', ipo.code),
                        },
                    ],
                }}
            />

            <Reveal className="mb-8 mt-32">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 text-xs font-semibold text-cream-400/70 transition-colors duration-500 ease-silk hover:text-cream-100"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 transition-transform duration-500 ease-silk group-hover:-translate-x-0.5">
                        <HiOutlineArrowLeft className="h-3.5 w-3.5" />
                    </span>
                    Kembali ke katalog
                </Link>
            </Reveal>

            {/* Hero — Asymmetric Bento */}
            <section className="grid gap-6 pb-12 lg:grid-cols-[1.35fr_1fr]">
                <Reveal className="h-full">
                    <div className="relative h-full overflow-hidden rounded-squircle border border-white/10 bg-white/5 p-1.5">
                        <div className="relative flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] border border-white/5 bg-ink-900/80 px-8 py-10 shadow-inset_hi sm:px-12 sm:py-14">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[8rem] leading-none tracking-[-0.06em] text-white/[0.03] sm:text-[12rem]"
                            >
                                {ipo.code}
                            </div>
                            <div className="relative">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-cream-400/70">
                                        {ipo.sector}
                                    </span>
                                </div>
                                <p className="mt-8 font-mono text-6xl font-semibold tracking-[-0.06em] text-cream-50 sm:text-7xl">
                                    {ipo.code}
                                </p>
                                <h1 className="mt-4 max-w-xl font-display text-2xl leading-tight text-cream-200 sm:text-3xl">
                                    {ipo.company_name}
                                </h1>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={140} className="h-full">
                    <dl className="grid h-full grid-cols-2 gap-3 lg:grid-cols-1">
                        <div className="col-span-2 rounded-squircle border border-white/10 bg-white/5 p-1.5 lg:col-span-1">
                            <div className="flex h-full flex-col justify-center rounded-[calc(2rem-0.375rem)] bg-ink-900/80 px-6 py-6 shadow-inset_hi">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400/70">
                                    {stats[0].label}
                                </dt>
                                <dd className="mt-3 font-mono text-2xl font-semibold tabular-nums text-copper-300">
                                    {stats[0].value}
                                </dd>
                            </div>
                        </div>
                        {stats.slice(1).map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-squircle border border-white/10 bg-white/5 p-1.5"
                            >
                                <div className="flex h-full flex-col justify-center rounded-[calc(2rem-0.375rem)] bg-ink-900/80 px-6 py-6 shadow-inset_hi">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400/70">
                                        {stat.label}
                                    </dt>
                                    <dd className="mt-3 font-mono text-xl font-semibold tabular-nums text-cream-100">
                                        {stat.value}
                                    </dd>
                                </div>
                            </div>
                        ))}
                    </dl>
                </Reveal>
            </section>

            {/* Tab Navigation */}
            <Reveal className="mb-8">
                <TabNavigation
                    tabs={tabs}
                    activeTabId={activeTab}
                    onChange={handleTabChange}
                />
            </Reveal>

            {/* Tab Content */}
            <Reveal className="mb-24 min-h-[400px]">
                <div className="rounded-squircle border border-white/10 bg-white/5 p-1.5">
                    <div className="min-h-[400px] rounded-[calc(2rem-0.375rem)] border border-white/5 bg-ink-900/80 p-5 shadow-inset_hi sm:p-8">
                        {renderTabContent()}
                    </div>
                </div>
            </Reveal>
        </AppLayout>
    );
}
