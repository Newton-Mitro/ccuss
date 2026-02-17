<?php

namespace App\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FiscalPeriod extends Model
{
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
}
