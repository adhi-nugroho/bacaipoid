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
        Schema::create('ipo_underwriter', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipo_id')->constrained('ipos')->cascadeOnDelete();
            $table->foreignId('underwriter_id')->constrained('underwriters')->cascadeOnDelete();
            $table->enum('role', ['lead', 'co-lead', 'member'])->default('member');
            $table->timestamps();

            // Indeks unik untuk mencegah duplikasi relasi underwriter yang sama pada satu IPO
            $table->unique(['ipo_id', 'underwriter_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ipo_underwriter');
    }
};
