<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LoanProduct extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\LoanProductFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'balance_type',
        'interest_rate',
        'interest_calculation',
        'interest_frequency',
        'customer_can_open_multiple_account',
        'settings',
        'is_system',
        'status',
    ];

    protected $casts = [
        'interest_rate' => 'decimal:6',
        'settings' => 'array',
        'is_system' => 'boolean',
        'status' => 'boolean',
        'customer_can_open_multiple_account' => 'boolean',
    ];

    protected $appends = ['category'];

    public function getCategoryAttribute(): string
    {
        return 'LOAN';
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function policy(): HasOne
    {
        return $this->hasOne(LoanPolicy::class);
    }

    public function accountMappings(): HasMany
    {
        return $this->hasMany(LoanProductAccountMapping::class);
    }

    public function financialAccounts(): MorphMany
    {
        return $this->morphMany(FinancialAccount::class, 'product');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(LoanApplication::class);
    }
}