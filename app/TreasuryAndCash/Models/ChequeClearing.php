<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChequeClearing extends Model
{
    use HasFactory;

    protected $fillable = ['cheque_id', 'branch_day_id', 'clearing_no', 'drawer_bank_name', 'drawer_bank_branch', 'drawer_account_no', 'amount', 'clearing_date', 'status', 'return_reason', 'cleared_date'];

    protected $casts = ['amount' => 'decimal:4', 'clearing_date' => 'date', 'cleared_date' => 'date'];

    public function cheque(): BelongsTo
    {
        return $this->belongsTo(Cheque::class);
    }
    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }
}