<?php

namespace App\FinanceAndAccounting\Models;

use App\Audit\Traits\Auditable;
use Database\Factories\AccountingPeriodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountingPeriod extends Model
{
    use HasFactory, Auditable;
    protected $fillable = [
        'fiscal_year_id',
        'period_name',
        'start_date',
        'end_date',
        'is_open',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_open' => 'boolean',
    ];

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class);
    }

    protected static function newFactory()
    {
        return AccountingPeriodFactory::new();
    }
}
