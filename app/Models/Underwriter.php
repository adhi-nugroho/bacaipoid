<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Underwriter extends Model
{
    protected $fillable = [
        'code', 'name', 'avg_return_30d', 'avg_return_90d', 'underperformed_percentage',
    ];

    /**
     * Get the IPOs associated with this underwriter.
     */
    public function ipos(): BelongsToMany
    {
        return $this->belongsToMany(Ipo::class)
            ->withPivot('role')
            ->withTimestamps();
    }
}
