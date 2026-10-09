<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ipos', function (Blueprint $table) {
            $table->decimal('dilution_percentage', 5, 2)->nullable()->change();
            $table->string('auditor_opinion')->nullable()->change();
            $table->decimal('related_party_transaction_percentage', 5, 2)->nullable()->change();
            $table->string('data_source')->nullable()->after('prospectus_pdf_url');
            $table->timestamp('source_synced_at')->nullable()->after('data_source');
            $table->index(['publish_status', 'status', 'listing_date'], 'ipos_public_catalog_index');
        });

        Schema::table('financial_summaries', function (Blueprint $table) {
            $table->integer('year')->nullable()->change();
            $table->bigInteger('revenue')->nullable()->change();
            $table->bigInteger('net_income')->nullable()->change();
            $table->bigInteger('total_assets')->nullable()->change();
            $table->bigInteger('total_liabilities')->nullable()->change();
            $table->bigInteger('total_equity')->nullable()->change();
            $table->decimal('debt_to_equity_ratio', 8, 2)->nullable()->change();
            $table->decimal('current_ratio', 8, 2)->nullable()->change();
            $table->decimal('roe', 8, 2)->nullable()->change();
            $table->decimal('roa', 8, 2)->nullable()->change();
            $table->unique(['ipo_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::table('financial_summaries', fn(Blueprint $table) => $table->dropUnique(['ipo_id', 'year']));
        Schema::table('ipos', function (Blueprint $table) {
            $table->dropIndex('ipos_public_catalog_index');
            $table->dropColumn(['data_source', 'source_synced_at']);
        });
    }
};
