<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnderwriterIpoHistory extends Model
{
    protected $fillable = [
        'underwriter_code',
        'code',
        'company_name',
        'sector',
        'ipo_price',
        'offering_shares',
        'listing_date',
        'return_30d',
        'return_90d',
        'price_30d',
        'price_90d',
        'performance_synced_at',
        'source_url',
    ];

    protected $casts = [
        'listing_date' => 'date:Y-m-d',
        'return_30d' => 'float',
        'return_90d' => 'float',
        'performance_synced_at' => 'datetime',
    ];
}
