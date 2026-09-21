<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\ShareAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DepositAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'financial_account_id',
        'financial_product_id',
        'account_kind',
        'status',
        'opened_at',
        'closed_at',
        'last_operated_at',
        'membership_eligible_at',
        'closure_reason',
    ];

    protected $casts = [
        'opened_at' => 'date',
        'closed_at' => 'date',
        'last_operated_at' => 'date',
        'membership_eligible_at' => 'date',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }

    public function shareAccount(): HasOne
    {
        return $this->hasOne(ShareAccount::class);
    }

    public function fixedDeposit(): HasOne
    {
        return $this->hasOne(FixedDeposit::class);
    }

    public function recurringDeposit(): HasOne
    {
        return $this->hasOne(RecurringDeposit::class);
    }
}
