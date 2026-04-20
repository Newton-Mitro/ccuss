<?php

namespace App\FinanceAndAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\FiscalPeriodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FiscalPeriod extends Model
{
    use HasFactory, Auditable, SoftDeletes; // ✅ added SoftDeletes

    protected $fillable = [
        'fiscal_year_id',
        'period_name',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'status' => 'string',
    ];

    // ------------------------
    // Relationships
    // ------------------------

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function voucherEntries(): HasMany // ✅ renamed (clean naming)
    {
        return $this->hasMany(Voucher::class, 'fiscal_period_id');
    }

    // ------------------------
    // Scopes (🔥 Powerful)
    // ------------------------

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeLocked($query)
    {
        return $query->where('status', 'locked');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'open'); // business meaning
    }

    // ------------------------
    // Accessors (UI Friendly)
    // ------------------------

    public function getStatusLabelAttribute(): string
    {
        return ucfirst($this->status);
    }

    public function getIsOpenAttribute(): bool
    {
        return $this->status === 'open';
    }

    public function getIsClosedAttribute(): bool
    {
        return $this->status === 'closed';
    }

    public function getIsLockedAttribute(): bool
    {
        return $this->status === 'locked';
    }

    // ------------------------
    // Business Rules (🔥 Important)
    // ------------------------

    public function canPost(): bool
    {
        return $this->status === 'open';
    }

    public function canEdit(): bool
    {
        return in_array($this->status, ['open', 'closed']);
    }

    // ------------------------
    // Factory
    // ------------------------

    protected static function newFactory(): FiscalPeriodFactory
    {
        return FiscalPeriodFactory::new();
    }
}