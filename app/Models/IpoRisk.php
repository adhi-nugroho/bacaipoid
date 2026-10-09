<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpoRisk extends Model
{
    protected $fillable = ['ipo_id', 'type', 'title', 'description'];

    /**
     * Get the IPO associated with this risk.
     */
    public function ipo(): BelongsTo
    {
        return $this->belongsTo(Ipo::class);
    }
}
