<?php

namespace App\FinanceAndAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use App\SystemAdministration\Models\Organization;
use Database\Factories\FiscalYearFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FiscalYear extends Model
{
    use HasFactory, Auditable, SoftDeletes; // ✅ added SoftDeletes

    protected $fillable = [
        'organization_id',
        'code',
        'start_date',
        'end_date',
        'is_closed',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_closed' => 'boolean',
    ];

    // ------------------------
    // Relationships
    // ------------------------

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(FiscalPeriod::class);
    }

    public function voucherEntries(): HasMany // ✅ renamed
    {
        return $this->hasMany(Voucher::class, 'fiscal_year_id');
    }

    // ------------------------
    // Scopes (🔥 High Value)
    // ------------------------

    public function scopeOpen($query)
    {
        return $query->where('is_closed', false);
    }

    public function scopeClosed($query)
    {
        return $query->where('is_closed', true);
    }

    // ------------------------
    // Accessors (UI + Logic)
    // ------------------------

    public function getStatusAttribute(): string
    {
        return $this->is_closed ? 'closed' : 'open';
    }

    public function getStatusLabelAttribute(): string
    {
        return ucfirst($this->status);
    }

    public function getIsOpenAttribute(): bool
    {
        return !$this->is_closed;
    }

    // ------------------------
    // Business Logic (🔥 Critical)
    // ------------------------

    /**
     * Can we post transactions in this fiscal year?
     */
    public function canPost(): bool
    {
        return !$this->is_closed;
    }

    /**
     * Check if a date falls within this fiscal year
     */
    public function containsDate($date): bool
    {
        return $date >= $this->start_date && $date <= $this->end_date;
    }

    /**
     * Get current open period (if any)
     */
    public function currentPeriod()
    {
        return $this->periods()
            ->where('status', 'open')
            ->orderBy('start_date')
            ->first();
    }

    // ------------------------
    // Factory
    // ------------------------

    protected static function newFactory(): FiscalYearFactory
    {
        return FiscalYearFactory::new();
    }
}