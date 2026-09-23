<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanGuarantor extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_application_id',
        'loan_account_id',
        'customer_id',
        'status',
        'accepted_at',
        'notes',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}