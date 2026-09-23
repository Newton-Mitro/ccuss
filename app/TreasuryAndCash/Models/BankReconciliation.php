<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankReconciliation extends Model
{
    use HasFactory;

    protected $fillable = ['bank_account_id', 'statement_date', 'statement_balance', 'book_balance', 'difference', 'status', 'reconciled_by', 'reconciled_at'];

    protected $casts = ['statement_date' => 'date', 'statement_balance' => 'decimal:4', 'book_balance' => 'decimal:4', 'difference' => 'decimal:4', 'reconciled_at' => 'datetime'];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }
}