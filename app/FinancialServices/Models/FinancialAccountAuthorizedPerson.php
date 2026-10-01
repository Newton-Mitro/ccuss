<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialAccountAuthorizedPerson extends Model
{
    use HasFactory;

    protected $table = 'financial_account_authorized_persons';

    protected $fillable = [
        'financial_account_id',
        'customer_id',
        'authorization_type',
        'designation',
        'transaction_limit',
        'effective_from',
        'effective_to',
        'is_active',
        'note',
    ];

    protected $casts = [
        'transaction_limit' => 'decimal:4',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}