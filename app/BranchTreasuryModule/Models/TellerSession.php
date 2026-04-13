<?php

namespace App\BranchTreasuryModule\Models;

use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use App\VoucherEntryModule\Models\VoucherEntry;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TellerSession extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'teller_id',
        'branch_id',
        'branch_day_id',
        'cash_account_id',
        'opened_at',
        'closed_at',
        'status',
        'opening_cash',
        'closing_cash',
        'expected_balance',
        'difference',
        'adjustment_voucher_id',
        'remarks'
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    public function cashAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'cash_account_id');
    }

    public function adjustmentTransaction(): BelongsTo
    {
        return $this->belongsTo(VoucherEntry::class, 'adjustment_voucher_id');
    }
}