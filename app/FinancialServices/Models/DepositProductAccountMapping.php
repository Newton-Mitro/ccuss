<?php

namespace App\FinancialServices\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositProductAccountMapping extends Model
{
    protected $fillable = ['deposit_product_id', 'transaction_type', 'debit_account_id', 'credit_account_id', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(DepositProduct::class, 'deposit_product_id');
    }

    public function debitAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'debit_account_id');
    }

    public function creditAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'credit_account_id');
    }
}