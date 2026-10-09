<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('underwriter_ipo_histories', function (Blueprint $table) {
            $table->id();
            $table->string('underwriter_code', 10)->index();
            $table->string('code', 10);
            $table->string('company_name');
            $table->string('sector')->nullable();
            $table->unsignedInteger('ipo_price');
            $table->unsignedBigInteger('offering_shares');
            $table->date('listing_date');
            $table->string('source_url');
            $table->timestamps();
            $table->unique(['underwriter_code', 'code']);
        });

        $now = now();
        DB::table('underwriter_ipo_histories')->insert([
            [
                'underwriter_code' => 'AZ',
                'code' => 'SUPA',
                'company_name' => 'PT Super Bank Indonesia Tbk',
                'sector' => 'Financials',
                'ipo_price' => 635,
                'offering_shares' => 4_406_612_300,
                'listing_date' => '2025-12-17',
                'source_url' => 'https://e-ipo.co.id/id/ipo/347/supa-pt-super-bank-indonesia-tbk',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'underwriter_code' => 'AZ',
                'code' => 'RATU',
                'company_name' => 'PT Raharja Energi Cepu Tbk',
                'sector' => 'Energy',
                'ipo_price' => 1150,
                'offering_shares' => 543_010_800,
                'listing_date' => '2025-01-08',
                'source_url' => 'https://www.e-ipo.co.id/en/ipo/326/ratu-pt-raharja-energi-cepu-tbk',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'underwriter_code' => 'AZ',
                'code' => 'RAAM',
                'company_name' => 'PT Tripar Multivision Plus Tbk',
                'sector' => 'Consumer Cyclicals',
                'ipo_price' => 234,
                'offering_shares' => 929_200_000,
                'listing_date' => '2023-05-08',
                'source_url' => 'https://e-ipo.co.id/id/ipo/231/raam-pt-tripar-multivision-plus-tbk',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'underwriter_code' => 'AZ',
                'code' => 'AWAN',
                'company_name' => 'PT Era Digital Media Tbk',
                'sector' => 'Technology',
                'ipo_price' => 100,
                'offering_shares' => 750_000_000,
                'listing_date' => '2023-04-18',
                'source_url' => 'https://e-ipo.co.id/id/ipo/227/awan-pt-era-digital-media-tbk',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'underwriter_code' => 'AZ',
                'code' => 'NSSS',
                'company_name' => 'PT Nusantara Sawit Sejahtera Tbk',
                'sector' => 'Consumer Non-Cyclicals',
                'ipo_price' => 127,
                'offering_shares' => 3_568_235_300,
                'listing_date' => '2023-03-10',
                'source_url' => 'https://e-ipo.co.id/en/ipo/222/nsss-pt-nusantara-sawit-sejahtera-tbk',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('underwriter_ipo_histories');
    }
};
