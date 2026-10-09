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
        Schema::create('ipos', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('company_name');
            $table->string('sector');
            $table->unsignedInteger('ipo_price');
            $table->unsignedBigInteger('offering_shares');
            $table->decimal('dilution_percentage', 5, 2);
            $table->boolean('has_secondary_offering')->default(false);
            $table->boolean('has_extra_lockup')->default(false);
            $table->text('lockup_details')->nullable();
            $table->json('shareholders')->nullable();
            $table->string('auditor_opinion');
            $table->decimal('related_party_transaction_percentage', 5, 2)->default(0);
            $table->text('related_party_details')->nullable();
            $table->enum('status', ['book_building', 'offering', 'listed'])->default('book_building');
            $table->enum('publish_status', ['draft', 'reviewed', 'published'])->default('draft');
            $table->date('listing_date')->nullable();
            $table->string('prospectus_pdf_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ipos');
    }
};
