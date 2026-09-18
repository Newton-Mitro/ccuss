<?php

namespace App\TreasuryAndCash\Models;

use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\Bank;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'bank_id',
        'financial_account_id',
        'account_name',
        'account_number',
        'routing_number',
        'account_type',
        'opening_balance',
        'is_reconcilable',
        'status',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:4',
        'is_reconcilable' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }
}
