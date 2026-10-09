<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipo_id')->constrained('ipos')->cascadeOnDelete();
            $table->integer('year');
            $table->bigInteger('revenue');
            $table->bigInteger('net_income');
            $table->bigInteger('total_assets');
            $table->bigInteger('total_liabilities');
            $table->bigInteger('total_equity');
            $table->decimal('debt_to_equity_ratio', 8, 2);
            $table->decimal('current_ratio', 8, 2);
            $table->decimal('roe', 8, 2);
            $table->decimal('roa', 8, 2);
            $table->boolean('is_non_recurring_highlighted')->default(false);
            $table->text('non_recurring_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_summaries');
    }
};
