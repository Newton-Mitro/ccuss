<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\FinancialServices\Models\FinancialProductPolicy;

class FinancialProduct extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\FinancialProductFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'category',
        'balance_type',
        'interest_rate',
        'interest_calculation',
        'interest_frequency',
        'settings',
        'is_system',
        'status',
    ];

    protected $casts = [
        'interest_rate' => 'decimal:6',
        'settings' => 'array',
        'is_system' => 'boolean',
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function policy(): HasOne
    {
        return $this->hasOne(FinancialProductPolicy::class);
    }

    public function accountMappings(): HasMany
    {
        return $this->hasMany(FinancialProductAccountMapping::class);
    }

    public function financialAccounts(): HasMany
    {
        return $this->hasMany(FinancialAccount::class);
    }
}