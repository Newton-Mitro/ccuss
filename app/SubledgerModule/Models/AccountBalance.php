<?php

namespace App\SubledgerModule\Models;

use App\FinanceAndAccounting\Models\FiscalPeriod;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountBalance extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'subledger_account_id',
        'fiscal_period_id',
        'opening_balance',
        'debit_total',
        'credit_total',
        'closing_balance',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'debit_total' => 'decimal:2',
        'credit_total' => 'decimal:2',
        'closing_balance' => 'decimal:2',
    ];

    public function subledgerAccount(): BelongsTo
    {
        return $this->belongsTo(SubledgerAccount::class);
    }

    public function fiscalPeriod(): BelongsTo
    {
        return $this->belongsTo(FiscalPeriod::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}