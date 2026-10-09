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
        Schema::create('chat_usages', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45);
            $table->date('usage_date');
            $table->integer('chat_count')->default(0);
            $table->timestamps();

            $table->unique(['ip_address', 'usage_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_usages');
    }
};
