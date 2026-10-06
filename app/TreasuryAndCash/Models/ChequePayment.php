<?php

namespace App\TreasuryAndCash\Models;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChequePayment extends Model
{
    protected $fillable = [
        'organization_id',
        'branch_id',
        'financial_account_id',
        'cheque_id',
        'teller_session_id',
        'financial_transaction_id',
        'signatory_customer_id',
        'status',
        'amount',
        'checks',
        'note',
        'return_reason',
        'received_by',
        'verified_by',
        'approved_by',
        'paid_by',
        'verified_at',
        'approved_at',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'checks' => 'array',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function cheque(): BelongsTo
    {
        return $this->belongsTo(Cheque::class);
    }

    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function signatory(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'signatory_customer_id');
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ChequePaymentEvent::class)->orderBy('id');
    }
}