<?php

namespace App\Http\Controllers;

use App\Models\Ipo;
use App\Models\UnderwriterIpoHistory;
use App\Services\ValuationService;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class IpoController extends Controller
{
    public function __construct(protected ValuationService $valuation) {}

    /**
     * Menampilkan katalog emiten IPO.
     */
    public function index(): Response
    {
        $ipos = Ipo::published()->whereIn('status', ['book_building', 'offering'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($ipo) => $this->formatIpoCard($ipo));

        return Inertia::render('Welcome', [
            'ipos' => $ipos,
        ]);
    }

    /**
     * Format data IPO untuk tampilan kartu di halaman katalog.
     *
     * @return array{id: string, code: string, company_name: string, sector: string, ipo_price: int, offering_shares: int, status: string, listing_date: string|null, dilution_percentage: float, has_secondary_offering: bool, has_extra_lockup: bool}
     */
    private function formatIpoCard(Ipo $ipo): array
    {
        return [
            'id' => $ipo->code,
            'code' => $ipo->code,
            'company_name' => $ipo->company_name,
            'sector' => $ipo->sector,
            'ipo_price' => (int) $ipo->ipo_price,
            'offering_shares' => (int) $ipo->offering_shares,
            'status' => $ipo->status,
            'listing_date' => $ipo->listing_date,
            'dilution_percentage' => (float) $ipo->dilution_percentage,
            'has_secondary_offering' => (bool) $ipo->has_secondary_offering,
            'has_extra_lockup' => (bool) $ipo->has_extra_lockup,
        ];
    }

    /**
     * Menampilkan detail analisis IPO berdasarkan ID.
     */
    public function show(string $code): Response
    {
        $ipo = Ipo::published()->with([
            'proceedAllocations',
            'underwriters',
            'financialSummaries',
            'ipoRisks',
        ])->where('code', strtoupper($code))->firstOrFail();

        // Cari IPO lain yang dihandle oleh underwriter yang sama
        $underwriterHistories = $ipo->underwriters->map(function ($underwriter) use ($ipo) {
            $currentMatches = Ipo::published()
                ->where('id', '!=', $ipo->id)
                ->whereHas('underwriters', fn ($query) => $query->where('underwriters.id', $underwriter->id))
                ->orderByDesc('listing_date')
                ->limit(6)
                ->get()
                ->map(fn ($relatedIpo) => [
                    'code' => $relatedIpo->code,
                    'company_name' => $relatedIpo->company_name,
                    'ipo_price' => (int) $relatedIpo->ipo_price,
                    'listing_date' => $relatedIpo->listing_date,
                    'status' => $relatedIpo->status,
                    'sector' => $relatedIpo->sector,
                    'source_url' => null,
                    'return_30d' => null,
                    'return_90d' => null,
                ]);

            $remainingSlots = max(0, 6 - $currentMatches->count());
            $historyMatches = $remainingSlots === 0
                ? collect()
                : UnderwriterIpoHistory::query()
                    ->where('underwriter_code', $underwriter->code)
                    ->whereNotIn('code', $currentMatches->pluck('code')->push($ipo->code))
                    ->orderByDesc('listing_date')
                    ->limit($remainingSlots)
                    ->get()
                    ->map(fn ($history) => [
                        'code' => $history->code,
                        'company_name' => $history->company_name,
                        'ipo_price' => (int) $history->ipo_price,
                        'listing_date' => $history->listing_date?->format('Y-m-d'),
                        'status' => 'listed',
                        'sector' => $history->sector ?? 'N/A',
                        'source_url' => $history->source_url,
                        'return_30d' => $history->return_30d,
                        'return_90d' => $history->return_90d,
                    ]);

            return [
                'underwriter' => [
                    'code' => $underwriter->code,
                    'name' => $underwriter->name,
                    'role' => $underwriter->pivot->role,
                ],
                'ipos' => $currentMatches->concat($historyMatches)->take(6)->values(),
            ];
        })->values();

        $formattedIpo = [
            'code' => $ipo->code,
            'company_name' => $ipo->company_name,
            'sector' => $ipo->sector,
            'status' => $ipo->status,
            'ipo_price' => (int) $ipo->ipo_price,
            'offering_shares' => (int) $ipo->offering_shares,
            'listing_date' => $ipo->listing_date,
            'allocations' => $ipo->proceedAllocations->map(function ($alloc) {
                return [
                    'id' => $alloc->id,
                    'category' => $alloc->category,
                    'percentage' => (float) $alloc->percentage,
                    'amount' => (int) $alloc->amount,
                    'description' => $alloc->description,
                ];
            }),
            'ownership' => [
                'dilution_percentage' => (float) $ipo->dilution_percentage,
                'has_secondary_offering' => (bool) $ipo->has_secondary_offering,
                'has_extra_lockup' => (bool) $ipo->has_extra_lockup,
                'lockup_details' => $ipo->lockup_details ?? '',
                'shareholders' => $ipo->shareholders ?? [],
            ],
            'underwriters' => $ipo->underwriters->map(function ($uw) {
                return [
                    'id' => $uw->id,
                    'code' => $uw->code,
                    'name' => $uw->name,
                    'role' => $uw->pivot->role,
                ];
            }),
            'financials' => [
                'auditor_opinion' => $ipo->auditor_opinion,
                'financial_data' => $ipo->financialSummaries
                    ->sortByDesc('year')
                    ->values()
                    ->map(function ($fs) {
                        return [
                            'id' => $fs->id,
                            'year' => $fs->year !== null ? (int) $fs->year : null,
                            'revenue' => $fs->revenue !== null ? (int) $fs->revenue : null,
                            'net_income' => $fs->net_income !== null ? (int) $fs->net_income : null,
                            'total_assets' => $fs->total_assets !== null ? (int) $fs->total_assets : null,
                            'total_liabilities' => $fs->total_liabilities !== null ? (int) $fs->total_liabilities : null,
                            'total_equity' => $fs->total_equity !== null ? (int) $fs->total_equity : null,
                            'debt_to_equity_ratio' => $fs->debt_to_equity_ratio !== null ? (float) $fs->debt_to_equity_ratio : null,
                            'current_ratio' => $fs->current_ratio !== null ? (float) $fs->current_ratio : null,
                            'roe' => $fs->roe !== null ? (float) $fs->roe : null,
                            'roa' => $fs->roa !== null ? (float) $fs->roa : null,
                            'is_non_recurring_highlighted' => (bool) $fs->is_non_recurring_highlighted,
                            'non_recurring_details' => $fs->non_recurring_details,
                        ];
                    }),
            ],
            'risks' => $ipo->ipoRisks->map(function ($risk) {
                return [
                    'id' => $risk->id,
                    'type' => $risk->type,
                    'title' => $risk->title,
                    'description' => $risk->description,
                ];
            }),
            'related_party' => [
                'percentage' => (float) $ipo->related_party_transaction_percentage,
                'details' => $ipo->related_party_details ?? '',
            ],
        ];

        return Inertia::render('IpoDetail', [
            'ipo' => $formattedIpo,
            'underwriter_histories' => $underwriterHistories,
            'valuation' => Inertia::defer(fn () => $this->valuation->estimate($ipo)),
        ]);
    }

    /**
     * Generate sitemap XML untuk SEO.
     */
    public function sitemap(): HttpResponse
    {
        $ipos = Ipo::published()
            ->select('code', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        $baseUrl = config('app.url');

        $urls = [
            ['loc' => $baseUrl, 'priority' => '1.0', 'changefreq' => 'hourly'],
        ];

        foreach ($ipos as $ipo) {
            $urls[] = [
                'loc' => $baseUrl.'/ipo/'.$ipo->code,
                'lastmod' => $ipo->updated_at?->toAtomString(),
                'priority' => '0.9',
                'changefreq' => 'daily',
            ];
        }

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Generate robots.txt dari APP_URL.
     */
    public function robots(): HttpResponse
    {
        $content = "User-agent: *\nDisallow:\n\nSitemap: ".config('app.url')."/sitemap.xml\n";

        return response($content, 200)
            ->header('Content-Type', 'text/plain');
    }
}
