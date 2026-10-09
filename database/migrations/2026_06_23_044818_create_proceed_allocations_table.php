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
        Schema::create('proceed_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipo_id')->constrained('ipos')->cascadeOnDelete();
            $table->enum('category', ['debt_repayment', 'capex', 'working_capital', 'acquisition', 'others']);
            $table->decimal('percentage', 5, 2);
            $table->unsignedBigInteger('amount');
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proceed_allocations');
    }
};
