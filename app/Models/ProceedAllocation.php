<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProceedAllocation extends Model
{
    protected $fillable = ['ipo_id', 'category', 'percentage', 'amount', 'description'];

    /**
     * Get the IPO associated with this allocation.
     */
    public function ipo(): BelongsTo
    {
        return $this->belongsTo(Ipo::class);
    }
}
