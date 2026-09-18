<?php

namespace App\TreasuryAndCash\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_day_id',
        'petty_cash_fund_id',
        'transaction_no',
        'type',
        'amount',
        'payee',
        'description',
        'expense_account_id',
        'status',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
    ];

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    public function pettyCashFund(): BelongsTo
    {
        return $this->belongsTo(PettyCashFund::class);
    }

    public function expenseAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'expense_account_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
