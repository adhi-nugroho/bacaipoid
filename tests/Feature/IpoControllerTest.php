<?php

use App\Models\Ipo;
use App\Models\Underwriter;

it('shows the welcome page with a list of published ipos', function () {
    // Buat data IPO published
    $ipo = Ipo::create([
        'code' => 'TEST',
        'company_name' => 'PT Test Emiten Tbk',
        'sector' => 'Teknologi',
        'ipo_price' => 100,
        'offering_shares' => 1000000,
        'dilution_percentage' => 10.00,
        'auditor_opinion' => 'WTP',
        'publish_status' => 'published',
        'status' => 'book_building',
        'shareholders' => [
            ['name' => 'Pengendali', 'before_percentage' => 100.0, 'after_percentage' => 90.0],
        ],
    ]);

    // Buat data IPO draft
    $draftIpo = Ipo::create([
        'code' => 'DFTS',
        'company_name' => 'PT Draft Emiten Tbk',
        'sector' => 'Properti',
        'ipo_price' => 120,
        'offering_shares' => 5000000,
        'dilution_percentage' => 15.00,
        'auditor_opinion' => 'WTP',
        'publish_status' => 'draft',
        'status' => 'book_building',
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);

    // Pastikan data yang published dikirim ke Inertia page
    $response->assertInertia(fn ($page) => $page
        ->component('Welcome')
        ->has('ipos', 1)
        ->where('ipos.0.code', 'TEST')
    );
});

it('shows the ipo detail page with all its relations', function () {
    $ipo = Ipo::create([
        'code' => 'DETA',
        'company_name' => 'PT Detail Emiten Tbk',
        'sector' => 'Energi',
        'ipo_price' => 200,
        'offering_shares' => 2000000,
        'dilution_percentage' => 20.00,
        'auditor_opinion' => 'WDP',
        'publish_status' => 'published',
        'status' => 'offering',
        'shareholders' => [
            ['name' => 'Pengendali', 'before_percentage' => 100.0, 'after_percentage' => 80.0],
        ],
    ]);

    // Tambahkan alokasi dana
    $ipo->proceedAllocations()->create([
        'category' => 'capex',
        'percentage' => 100.00,
        'amount' => 400000000,
        'description' => '100% capex',
    ]);

    // Tambahkan underwriter
    $underwriter = Underwriter::create([
        'code' => 'PD',
        'name' => 'Indo Premier',
    ]);
    $ipo->underwriters()->attach($underwriter->id, ['role' => 'lead']);

    // Tambahkan financial summary
    $ipo->financialSummaries()->create([
        'year' => 2025,
        'revenue' => 100000000,
        'net_income' => 5000000,
        'total_assets' => 500000000,
        'total_liabilities' => 200000000,
        'total_equity' => 300000000,
        'debt_to_equity_ratio' => 0.67,
        'current_ratio' => 1.5,
        'roe' => 1.67,
        'roa' => 1.0,
        'is_non_recurring_highlighted' => false,
    ]);

    // Tambahkan risiko
    $ipo->ipoRisks()->create([
        'type' => 'specific',
        'title' => 'Risiko Operasional',
        'description' => 'Deskripsi risiko',
    ]);

    $response = $this->get('/ipo/'.$ipo->code);

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('IpoDetail')
        ->has('ipo')
        ->where('ipo.code', 'DETA')
        ->has('ipo.allocations', 1)
        ->has('ipo.underwriters', 1)
        ->has('ipo.financials.financial_data', 1)
        ->has('ipo.risks', 1)
    );
});
