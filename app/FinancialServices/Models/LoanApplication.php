<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanGuarantor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'customer_id',
        'financial_product_id',
        'application_no',
        'requested_amount',
        'approved_amount',
        'requested_term_months',
        'purpose',
        'status',
        'applied_at',
        'approved_at',
        'approved_by',
        'decision_note',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:4',
        'approved_amount' => 'decimal:4',
        'applied_at' => 'date',
        'approved_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }

    public function loanAccount(): HasOne
    {
        return $this->hasOne(LoanAccount::class);
    }

    public function collaterals(): HasMany
    {
        return $this->hasMany(LoanCollateral::class);
    }

    public function guarantors(): HasMany
    {
        return $this->hasMany(LoanGuarantor::class);
    }
}
