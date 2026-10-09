<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('underwriter_ipo_histories', function (Blueprint $table) {
            $table->decimal('return_30d', 8, 2)->nullable()->after('listing_date');
            $table->decimal('return_90d', 8, 2)->nullable()->after('return_30d');
            $table->unsignedInteger('price_30d')->nullable()->after('return_90d');
            $table->unsignedInteger('price_90d')->nullable()->after('price_30d');
            $table->timestamp('performance_synced_at')->nullable()->after('price_90d');
        });
    }

    public function down(): void
    {
        Schema::table('underwriter_ipo_histories', function (Blueprint $table) {
            $table->dropColumn([
                'return_30d', 'return_90d', 'price_30d', 'price_90d',
                'performance_synced_at',
            ]);
        });
    }
};
