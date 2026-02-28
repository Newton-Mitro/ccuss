<?php

namespace App\Accounting\Models;

use App\Audit\Traits\Auditable;
use Database\Factories\LedgerAccountBalanceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerAccountBalance extends Model
{
    use HasFactory, Auditable;
    protected $fillable = [
        'ledger_account_id',
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

    public function ledgerAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class);
    }

    public function fiscalPeriod(): BelongsTo
    {
        return $this->belongsTo(FiscalPeriod::class);
    }

    protected static function newFactory()
    {
        return LedgerAccountBalanceFactory::new();
    }
}
