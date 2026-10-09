<?php

use App\Models\Ipo;

function ipoForSecurityTest(array $overrides = []): Ipo
{
    return Ipo::create(array_merge([
        'code' => 'SAFE',
        'company_name' => 'PT Safe Data Tbk',
        'sector' => 'Teknologi',
        'ipo_price' => 100,
        'offering_shares' => 1_000_000,
        'dilution_percentage' => 10,
        'auditor_opinion' => 'WTP',
        'publish_status' => 'published',
        'status' => 'book_building',
    ], $overrides));
}

it('does not expose draft ipo details', function () {
    $ipo = ipoForSecurityTest(['code' => 'DRFT', 'publish_status' => 'draft']);

    $this->get(route('ipo.show', $ipo->code))
        ->assertNotFound();
});
