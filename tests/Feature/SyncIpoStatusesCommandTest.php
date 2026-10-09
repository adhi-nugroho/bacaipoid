<?php

use App\Models\Ipo;
use Illuminate\Support\Facades\Process;

function ipoForStatusSync(array $overrides = []): Ipo
{
    return Ipo::query()->create(array_merge([
        'code' => 'TEST',
        'company_name' => 'PT Test Tbk',
        'sector' => 'Technology',
        'ipo_price' => 100,
        'offering_shares' => 1000000,
        'status' => 'book_building',
        'publish_status' => 'published',
    ], $overrides));
}

test('it advances an IPO status from the daily source snapshot', function () {
    $ipo = ipoForStatusSync();
    Process::fake([
        '*' => Process::result(output: json_encode([
            ['code' => 'TEST', 'status' => 'offering'],
        ])),
    ]);

    $this->artisan('ipo:sync-statuses')
        ->expectsOutput('Status 1 IPO berhasil diperbarui.')
        ->assertSuccessful();

    expect($ipo->refresh()->status)->toBe('offering')
        ->and($ipo->source_synced_at)->not->toBeNull();
});

test('it never moves an IPO status backwards', function () {
    $ipo = ipoForStatusSync(['status' => 'listed']);
    Process::fake([
        '*' => Process::result(output: json_encode([
            ['code' => 'TEST', 'status' => 'book_building'],
        ])),
    ]);

    $this->artisan('ipo:sync-statuses')->assertSuccessful();

    expect($ipo->refresh()->status)->toBe('listed');
});

test('it leaves data untouched when the source request fails', function () {
    $ipo = ipoForStatusSync();
    Process::fake([
        '*' => Process::result(errorOutput: 'source unavailable', exitCode: 1),
    ]);

    $this->artisan('ipo:sync-statuses')->assertFailed();

    expect($ipo->refresh()->status)->toBe('book_building');
});
