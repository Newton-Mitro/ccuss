<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\LoanProtectionPolicy;
use App\FinancialServices\Models\LoanArrear;
use App\FinancialServices\Models\LoanSchedule;
use App\FinancialServices\Models\LoanRepayment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LoanAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'financial_account_id',
        'financial_product_id',
        'loan_application_id',
        'loan_no',
        'principal_amount',
        'disbursed_amount',
        'contractual_rate',
        'interest_calculation',
        'term_months',
        'approved_at',
        'disbursed_at',
        'maturity_date',
        'status',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:4',
        'disbursed_amount' => 'decimal:4',
        'contractual_rate' => 'decimal:6',
        'approved_at' => 'date',
        'disbursed_at' => 'date',
        'maturity_date' => 'date',
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

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }

    public function protectionPolicy(): HasOne
    {
        return $this->hasOne(LoanProtectionPolicy::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(LoanSchedule::class);
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }

    public function arrears(): HasMany
    {
        return $this->hasMany(LoanArrear::class);
    }

    public function disbursements(): HasMany
    {
        return $this->hasMany(LoanDisbursement::class);
    }
}
