<?php

namespace App\Services;

use App\Helpers\JsonParser;
use App\Models\Ipo;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ValuationService
{
    /** Cache lifetime for an IPO valuation, in seconds (default 24h). */
    private const CACHE_TTL = 86400;

    public function __construct(protected AiManager $aiManager) {}

    /**
     * Hitung estimasi harga wajar IPO dengan AI.
     *
     * Hasil di-cache per kode IPO agar panggilan AI yang mahal tidak diulang.
     *
     * @return array{fair_price_min:int, fair_price_max:int, pe_multiplier_min:float|null, pe_multiplier_max:float|null, valuation_status:string, methodology:string}|array{error:string, config_missing?:bool}
     */
    public function estimate(Ipo $ipo): array
    {
        if (empty(config('services.sumopod.api_key'))) {
            return [
                'error' => 'Layanan AI valuasi belum dikonfigurasi (API key tidak ditemukan).',
                'config_missing' => true,
            ];
        }

        $cacheKey = 'valuation.'.$ipo->code;

        /** @var array|null $cached */
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return $cached;
        }

        $result = $this->calculate($ipo);

        if (! isset($result['error'])) {
            Cache::put($cacheKey, $result, self::CACHE_TTL);
        }

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    private function calculate(Ipo $ipo): array
    {
        try {
            $provider = $this->aiManager->make('sumopod');
            $rawResponse = $provider->generate(
                $this->systemPrompt(),
                $this->userPrompt($ipo),
                'deepseek-v4-pro',
                maxTokens: 2048,
                temperature: 0.4,
                timeout: 60
            );

            $parsed = JsonParser::parse($rawResponse);

            if ($parsed === null) {
                Log::error('[ValuationService] Gagal parse JSON dari AI', [
                    'ipo' => $ipo->code,
                    'raw' => mb_substr($rawResponse, 0, 500),
                ]);

                return ['error' => 'Gagal memproses hasil valuasi AI. Silakan coba lagi.'];
            }

            foreach (['fair_price_min', 'fair_price_max', 'valuation_status', 'methodology'] as $field) {
                if (! isset($parsed[$field])) {
                    Log::error('[ValuationService] Response AI tidak lengkap', [
                        'ipo' => $ipo->code,
                        'missing' => $field,
                    ]);

                    return ['error' => "Response AI tidak lengkap (missing: {$field}). Silakan coba lagi."];
                }
            }

            if (! is_numeric($parsed['fair_price_min'])
                || ! is_numeric($parsed['fair_price_max'])
                || (int) $parsed['fair_price_min'] < 0
                || (int) $parsed['fair_price_max'] < (int) $parsed['fair_price_min']
                || ! in_array($parsed['valuation_status'], ['undervalued', 'fair', 'overvalued'], true)
                || ! is_string($parsed['methodology'])) {
                Log::warning('[ValuationService] Response AI tidak valid', [
                    'ipo' => $ipo->code,
                    'parsed' => $parsed,
                ]);

                return ['error' => 'Hasil valuasi AI tidak valid. Silakan coba lagi.'];
            }

            return [
                'fair_price_min' => (int) $parsed['fair_price_min'],
                'fair_price_max' => (int) $parsed['fair_price_max'],
                'pe_multiplier_min' => isset($parsed['pe_multiplier_min']) ? (float) $parsed['pe_multiplier_min'] : null,
                'pe_multiplier_max' => isset($parsed['pe_multiplier_max']) ? (float) $parsed['pe_multiplier_max'] : null,
                'valuation_status' => $parsed['valuation_status'],
                'methodology' => $parsed['methodology'],
            ];
        } catch (\Throwable $e) {
            Log::error('[ValuationService] Error panggil AI', [
                'ipo' => $ipo->code,
                'message' => $e->getMessage(),
            ]);

            return ['error' => 'Gagal menghubungi layanan AI untuk valuasi. Silakan coba lagi.'];
        }
    }

    private function systemPrompt(): string
    {
        return 'Anda adalah analis valuasi saham IPO Indonesia yang sangat berpengalaman. '
            .'Tugas Anda adalah memberikan estimasi harga wajar saham IPO berdasarkan data fundamental, '
            ."perbandingan sektor, kondisi pasar Indonesia, dan metrik keuangan yang tersedia.\n\n"
            ."Aturan:\n"
            ."- Gunakan data yang diberikan sebagai dasar analisis.\n"
            ."- Jika data utama tidak tersedia, nyatakan valuasi tidak dapat dihitung; jangan mengarang data pembanding.\n"
            ."- Berikan rentang P/E ratio yang wajar berdasarkan sektor dan kondisi pasar modal Indonesia saat ini.\n"
            ."- Hitung harga wajar: EPS × P/E ratio (atau estimasi berbasis sektor jika EPS tidak diketahui).\n"
            ."- Tentukan status valuasi: undervalued (harga IPO < 95% harga wajar min), fair (dalam rentang), overvalued (harga IPO > 105% harga wajar max).\n"
            ."- Berikan penjelasan metodologi yang detail, transparan, dan mudah dipahami investor ritel.\n"
            ."- Jawaban HARUS dalam format JSON valid tanpa markdown fences.\n\n"
            ."Format JSON yang diharapkan:\n"
            ."{\n"
            .'  "fair_price_min": <number dalam Rupiah, integer>,'."\n"
            .'  "fair_price_max": <number dalam Rupiah, integer>,'."\n"
            .'  "pe_multiplier_min": <number, P/E ratio minimum yang wajar>,'."\n"
            .'  "pe_multiplier_max": <number, P/E ratio maximum yang wajar>,'."\n"
            .'  "valuation_status": "<undervalued | fair | overvalued>",'."\n"
            .'  "methodology": "<string, penjelasan lengkap dalam Bahasa Indonesia tentang bagaimana valuasi dihitung: sektor pembanding apa yang digunakan, mengapa P/E segitu, asumsi yang diambil, dan risiko estimasi>"'."\n"
            .'}';
    }

    private function userPrompt(Ipo $ipo): string
    {
        $latestFs = $ipo->financialSummaries->sortByDesc('year')->first();

        $financialData = $latestFs
            ? "Data Keuangan Tahun {$latestFs->year}:\n"
                .'- Pendapatan: Rp '.number_format($latestFs->revenue, 0, ',', '.')."\n"
                .'- Laba Bersih: Rp '.number_format($latestFs->net_income, 0, ',', '.')."\n"
                .'- Total Aset: Rp '.number_format($latestFs->total_assets, 0, ',', '.')."\n"
                .'- Total Liabilitas: Rp '.number_format($latestFs->total_liabilities, 0, ',', '.')."\n"
                .'- Total Ekuitas: Rp '.number_format($latestFs->total_equity, 0, ',', '.')."\n"
                ."- ROE: {$latestFs->roe}%\n"
                ."- ROA: {$latestFs->roa}%\n"
                ."- DER: {$latestFs->debt_to_equity_ratio}x\n"
            : "Data keuangan belum tersedia.\n";

        $underwriterInfo = '';
        if ($ipo->underwriters->isNotEmpty()) {
            $underwriterInfo = "Underwriter:\n";
            foreach ($ipo->underwriters as $uw) {
                $underwriterInfo .= "- {$uw->code} ({$uw->name}), Role: {$uw->pivot->role}\n";
            }
        }

        return "Mohon analisis valuasi untuk saham IPO berikut:\n\n"
            ."Kode Saham: {$ipo->code}\n"
            ."Nama Perusahaan: {$ipo->company_name}\n"
            ."Sektor: {$ipo->sector}\n"
            .'Harga IPO: Rp '.number_format($ipo->ipo_price, 0, ',', '.')." per lembar\n"
            .'Jumlah Saham Ditawarkan: '.number_format($ipo->offering_shares, 0, ',', '.')." lembar\n"
            ."Dilusi Kepemilikan: {$ipo->dilution_percentage}%\n"
            ."Status: {$ipo->status}\n"
            .($ipo->listing_date ? "Tanggal Listing: {$ipo->listing_date}\n" : '')
            ."\n{$financialData}\n"
            .($underwriterInfo ? "\n{$underwriterInfo}\n" : '')
            ."\nTolong berikan estimasi harga wajar, range P/E yang sesuai, status valuasi, dan penjelasan metodologi yang detail.";
    }
}
