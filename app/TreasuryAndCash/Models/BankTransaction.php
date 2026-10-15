<?php

namespace App\TreasuryAndCash\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['branch_day_id', 'bank_account_id', 'counterpart_account_id', 'transaction_no', 'type', 'amount', 'transaction_date', 'reference', 'description', 'balance_after', 'status'];

    protected $casts = ['amount' => 'decimal:4', 'transaction_date' => 'date', 'balance_after' => 'decimal:4'];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function counterpartAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'counterpart_account_id');
    }

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }
}
