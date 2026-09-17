<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;

class FinancialTransactionEntry extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\FinancialTransactionEntryFactory::new();
    }

    protected $fillable = [
        'financial_transaction_id',
        'financial_account_id',
        'direction',
        'amount',
        'balance_after',
        'description',
        'line_no',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'balance_after' => 'decimal:4',
        'line_no' => 'integer',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }
}