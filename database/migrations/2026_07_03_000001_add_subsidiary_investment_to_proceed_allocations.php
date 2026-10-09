<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE proceed_allocations MODIFY COLUMN category ENUM('debt_repayment', 'capex', 'working_capital', 'acquisition', 'subsidiary_investment', 'others')");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE proceed_allocations MODIFY COLUMN category ENUM('debt_repayment', 'capex', 'working_capital', 'acquisition', 'others')");
    }
};
