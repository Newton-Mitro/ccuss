<?php

namespace App\FinanceAndAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use App\FinanceAndAccounting\Models\FiscalYear;
use Database\Factories\FiscalPeriodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FiscalPeriod extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'fiscal_year_id',
        'period_name',
        'start_date',
        'end_date',
        'status', // matches your enum in migration
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'status' => 'string',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class, 'fiscal_year_id');
    }

    public function voucher_entries(): HasMany
    {
        return $this->hasMany(Voucher::class, 'fiscal_period_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): FiscalPeriodFactory
    {
        return FiscalPeriodFactory::new();
    }
}