<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialSummary extends Model
{
    protected $fillable = [
        'ipo_id', 'year', 'revenue', 'net_income', 'total_assets',
        'total_liabilities', 'total_equity', 'debt_to_equity_ratio',
        'current_ratio', 'roe', 'roa', 'is_non_recurring_highlighted',
        'non_recurring_details',
    ];

    protected $casts = [
        'is_non_recurring_highlighted' => 'boolean',
    ];

    /**
     * Get the IPO associated with this financial summary.
     */
    public function ipo(): BelongsTo
    {
        return $this->belongsTo(Ipo::class);
    }
}
