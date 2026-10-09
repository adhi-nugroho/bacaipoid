<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ipo extends Model
{
    protected $fillable = [
        'code', 'company_name', 'sector', 'ipo_price', 'offering_shares',
        'dilution_percentage', 'has_secondary_offering', 'has_extra_lockup',
        'lockup_details', 'shareholders', 'auditor_opinion',
        'related_party_transaction_percentage', 'related_party_details',
        'status', 'publish_status', 'listing_date', 'prospectus_pdf_url',
        'data_source', 'source_synced_at',
    ];

    protected $casts = [
        'shareholders' => 'array',
        'has_secondary_offering' => 'boolean',
        'has_extra_lockup' => 'boolean',
        'source_synced_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('publish_status', 'published');
    }

    /**
     * Get the proceed allocations for the IPO.
     */
    public function proceedAllocations(): HasMany
    {
        return $this->hasMany(ProceedAllocation::class);
    }

    /**
     * Get the underwriters associated with the IPO.
     */
    public function underwriters(): BelongsToMany
    {
        return $this->belongsToMany(Underwriter::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the financial summaries for the IPO.
     */
    public function financialSummaries(): HasMany
    {
        return $this->hasMany(FinancialSummary::class);
    }

    /**
     * Get the risks identified for the IPO.
     */
    public function ipoRisks(): HasMany
    {
        return $this->hasMany(IpoRisk::class);
    }
}
