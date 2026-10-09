<?php

namespace App\Services;

use App\Models\UnderwriterIpoHistory;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarketPerformanceService
{
    public function update(UnderwriterIpoHistory $history): void
    {
        $listingDate = CarbonImmutable::parse($history->listing_date);
        if ($listingDate->isFuture()) {
            return;
        }

        $response = Http::retry(2, 500)
            ->timeout(20)
            ->get('https://query1.finance.yahoo.com/v8/finance/chart/'.$history->code.'.JK', [
                'period1' => $listingDate->startOfDay()->timestamp,
                'period2' => $listingDate->addDays(105)->endOfDay()->timestamp,
                'interval' => '1d',
                'events' => 'history',
            ]);

        if ($response->failed()) {
            Log::warning('[MarketPerformance] Price source unavailable', [
                'code' => $history->code,
                'status' => $response->status(),
            ]);

            return;
        }

        $result = $response->json('chart.result.0');
        $timestamps = $result['timestamp'] ?? [];
        $closes = $result['indicators']['quote'][0]['close'] ?? [];
        $prices = [];
        foreach ($timestamps as $index => $timestamp) {
            if (isset($closes[$index]) && is_numeric($closes[$index])) {
                $prices[CarbonImmutable::createFromTimestamp($timestamp)->startOfDay()->timestamp]
                    = (float) $closes[$index];
            }
        }

        [$price30, $return30] = $this->performanceAt($prices, $listingDate->addDays(30), (int) $history->ipo_price);
        [$price90, $return90] = $this->performanceAt($prices, $listingDate->addDays(90), (int) $history->ipo_price);

        $history->update([
            'price_30d' => $price30,
            'return_30d' => $return30,
            'price_90d' => $price90,
            'return_90d' => $return90,
            'performance_synced_at' => now(),
        ]);
    }

    private function performanceAt(array $prices, CarbonImmutable $target, int $ipoPrice): array
    {
        if ($target->isFuture() || $ipoPrice <= 0) {
            return [null, null];
        }

        ksort($prices);
        foreach ($prices as $timestamp => $price) {
            if ($timestamp >= $target->startOfDay()->timestamp) {
                $roundedPrice = (int) round($price);

                return [$roundedPrice, round((($price - $ipoPrice) / $ipoPrice) * 100, 2)];
            }
        }

        return [null, null];
    }
}
