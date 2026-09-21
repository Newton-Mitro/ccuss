<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\ShareAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    public function holders(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'deposit_account_holders')
            ->withPivot(['role', 'ownership_percent', 'guardian_customer_id'])
            ->withTimestamps();
    }

    public function canHaveJointHolders(): bool
    {
        return in_array($this->account_kind, [
            'SAVINGS',
            'FIXED_DEPOSIT',
            'RECURRING_DEPOSIT',
        ], true);
    }

    public function isMinorAccount(): bool
    {
        return $this->customer?->type === Customer::TYPE_INDIVIDUAL
            && $this->customer->dob !== null
            && $this->customer->dob->age < 18;
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

        if ($isMinorHolder) {
            $isMinorGuardian = $guardian?->type === Customer::TYPE_INDIVIDUAL
                && $guardian->dob !== null
                && $guardian->dob->age >= 18;

            if (!$guardian || $guardian->id === $holder->id || !$isMinorGuardian) {
                throw new \InvalidArgumentException('A minor account holder requires an adult individual guardian.');
            }
        }

        $this->holders()->syncWithoutDetaching([
            $holder->id => [
                'role' => $role,
                'ownership_percent' => $ownershipPercent,
                'guardian_customer_id' => $guardian?->id,
            ],
        ]);
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
