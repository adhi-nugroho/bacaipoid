import React from 'react';
import { Head } from '@inertiajs/react';

interface SeoMetaProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    noindex?: boolean;
    structuredData?: Record<string, unknown>;
}

export default function SeoMeta({
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    noindex = false,
    structuredData,
}: SeoMetaProps) {
    const defaultImage = '/image/logo.png';
    const image = ogImage || defaultImage;

    return (
        <Head>
            {/* Title */}
            <title>{title}</title>

            {/* Basic Meta */}
            <meta name="description" content={description} />
            <meta
                name="robots"
                content={noindex ? 'noindex, nofollow' : 'index, follow'}
            />

            {/* Canonical */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={image} />
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Head>
    );
}
