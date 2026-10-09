<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- SEO Defaults -->
        <meta name="description" content="MariBacaIPO: Analisis IPO Indonesia. Ringkasan prospektus terstruktur: alokasi dana, risiko utama, rasio keuangan, dan indikasi exit liquidity untuk investor ritel." />
        <meta name="keywords" content="IPO, analisis IPO, prospektus, saham, Bursa Efek Indonesia, book building, offering, emiten, investasi" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="id" />
        <meta name="author" content="MariBacaIPO" />

        <!-- Geo Tags -->
        <meta name="geo.region" content="ID" />
        <meta name="geo.placename" content="Indonesia" />
        <meta name="geo.country" content="ID" />
        <meta name="ICBM" content="-2.548926, 118.0148634" />

        <!-- Open Graph Defaults -->
        <meta property="og:site_name" content="MariBacaIPO" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:image" content="{{ asset('image/logo.png') }}" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        <!-- Twitter Defaults -->
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="{{ asset('image/logo.png') }}" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700,800|instrument-serif:400,400i|jetbrains-mono:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
