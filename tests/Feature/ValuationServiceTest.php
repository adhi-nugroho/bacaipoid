<?php

use App\Models\Ipo;
use App\Services\ValuationService;
use Illuminate\Support\Facades\Cache;

it('returns config_missing when the AI key is absent', function () {
    config()->set('services.sumopod.api_key', null);

    $ipo = Ipo::create([
        'code' => 'VALU',
        'company_name' => 'PT Valuasi Emiten Tbk',
        'sector' => 'Teknologi',
        'ipo_price' => 100,
        'offering_shares' => 1000000,
        'dilution_percentage' => 10.00,
        'auditor_opinion' => 'WTP',
        'publish_status' => 'published',
        'status' => 'book_building',
    ]);

    $result = app(ValuationService::class)->estimate($ipo);

    expect($result)->toHaveKey('error')
        ->and($result['error'])->toContain('belum dikonfigurasi')
        ->and($result['config_missing'] ?? false)->toBeTrue();
});

it('does not cache failed valuations', function () {
    config()->set('services.sumopod.api_key', null);
    Cache::flush();

    $ipo = Ipo::create([
        'code' => 'NOCA',
        'company_name' => 'PT No Cache Emiten Tbk',
        'sector' => 'Teknologi',
        'ipo_price' => 100,
        'offering_shares' => 1000000,
        'dilution_percentage' => 10.00,
        'auditor_opinion' => 'WTP',
        'publish_status' => 'published',
        'status' => 'book_building',
    ]);

    app(ValuationService::class)->estimate($ipo);

    expect(Cache::has('valuation.NOCA'))->toBeFalse();
});
