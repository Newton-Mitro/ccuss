<?php

namespace App\FinanceAndAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use App\SystemAdministration\Models\Organization;
use Database\Factories\FiscalYearFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FiscalYear extends Model
{
    use HasFactory, Auditable;

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

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(FiscalPeriod::class, 'fiscal_year_id');
    }

    public function voucher_entries(): HasMany
    {
        return $this->hasMany(Voucher::class, 'fiscal_year_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): FiscalYearFactory
    {
        return FiscalYearFactory::new();
    }
}