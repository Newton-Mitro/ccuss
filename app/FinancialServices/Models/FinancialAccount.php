<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\FinancialServices\Models\DepositNominee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\FinancialTransactionEntry;

class FinancialAccount extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\FinancialAccountFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'branch_id',
        'financial_product_id',
        'holder_type',
        'holder_id',
        'account_no',
        'name',
        'account_type',
        'status',
        'balance',
        'available_balance',
        'interest_accrued',
        'opened_at',
        'closed_at',
        'last_operated_at',
        'membership_eligible_at',
        'closure_reason',
        'metadata',
    ];

    protected $casts = [
        'balance' => 'decimal:4',
        'available_balance' => 'decimal:4',
        'interest_accrued' => 'decimal:4',
        'opened_at' => 'date',
        'closed_at' => 'date',
        'last_operated_at' => 'date',
        'membership_eligible_at' => 'date',
        'metadata' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }

    public function holder(): MorphTo
    {
        return $this->morphTo();
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'holder_id');
    }

    public function transactions(): HasManyThrough
    {
        return $this->hasManyThrough(
            FinancialTransaction::class,
            FinancialTransactionEntry::class,
            'financial_account_id',
            'id',
            'id',
            'financial_transaction_id',
        );
    }

    public function holders(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'deposit_account_holders', 'financial_account_id')
            ->withPivot(['role', 'ownership_percent', 'guardian_customer_id'])
            ->withTimestamps();
    }

    public function nominees(): HasMany
    {
        return $this->hasMany(DepositNominee::class);
    }

    public function chequeBooks(): HasMany
    {
        return $this->hasMany(\App\TreasuryAndCash\Models\ChequeBook::class, 'financial_account_id');
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

    public function loanAccount(): HasOne
    {
        return $this->hasOne(LoanAccount::class);
    }

    public function canHaveJointHolders(): bool
    {
        return in_array($this->account_type, [
            'SAVINGS',
            'FIXED_DEPOSIT',
            'RECURRING_DEPOSIT',
        ], true);
    }

    public function isMinorAccount(): bool
    {
        return $this->holder instanceof Customer
            && $this->holder->type === Customer::TYPE_INDIVIDUAL
            && $this->holder->dob !== null
            && $this->holder->dob->age < 18;
    }

    public function requiresGuardian(): bool
    {
        return $this->isMinorAccount();
    }

    public function addHolder(
        Customer $holder,
        string $role = 'JOINT',
        ?Customer $guardian = null,
        float $ownershipPercent = 100,
    ): void {
        if ($role === 'JOINT' && !$this->canHaveJointHolders()) {
            throw new \InvalidArgumentException('Share accounts cannot have joint holders.');
        }

        if ($ownershipPercent <= 0 || $ownershipPercent > 100) {
            throw new \InvalidArgumentException('Ownership percentage must be greater than 0 and no more than 100.');
        }

        $isMinorHolder = $holder->type === Customer::TYPE_INDIVIDUAL
            && $holder->dob !== null
            && $holder->dob->age < 18;

        $isMinorGuardian = $guardian?->type === Customer::TYPE_INDIVIDUAL
            && $guardian->dob !== null
            && $guardian->dob->age >= 18;

        if ($isMinorHolder && (!$guardian || $guardian->id === $holder->id || !$isMinorGuardian)) {
            throw new \InvalidArgumentException('A minor account holder requires an adult individual guardian.');
        }

        $this->holders()->syncWithoutDetaching([
            $holder->id => [
                'role' => $role,
                'ownership_percent' => $ownershipPercent,
                'guardian_customer_id' => $guardian?->id,
            ],
        ]);
    }

    public function defaultEvents(): HasMany
    {
        return $this->hasMany(AccountDefaultEvent::class);
    }

    public function fines(): HasMany
    {
        return $this->hasMany(AccountFine::class);
    }

    public function interestProvisions(): HasMany
    {
        return $this->hasMany(InterestProvision::class);
    }
}