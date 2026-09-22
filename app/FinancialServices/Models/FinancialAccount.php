<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'metadata',
    ];

    protected $casts = [
        'balance' => 'decimal:4',
        'available_balance' => 'decimal:4',
        'interest_accrued' => 'decimal:4',
        'opened_at' => 'date',
        'closed_at' => 'date',
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

    public function depositAccount(): HasOne
    {
        return $this->hasOne(DepositAccount::class);
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