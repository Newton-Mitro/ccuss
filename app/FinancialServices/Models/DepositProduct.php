<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class DepositProduct extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\DepositProductFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'category',
        'balance_type',
        'interest_calculation',
        'interest_frequency',
        'customer_can_open_multiple_account',
        'settings',
        'is_system',
        'status',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_system' => 'boolean',
        'status' => 'boolean',
        'customer_can_open_multiple_account' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function policy(): HasOne
    {
        return $this->hasOne(DepositPolicy::class);
    }

    public function accountMappings(): HasMany
    {
        return $this->hasMany(DepositProductAccountMapping::class);
    }

    public function financialAccounts(): MorphMany
    {
        return $this->morphMany(FinancialAccount::class, 'product');
    }

    public function terms(): HasMany
    {
        return $this->hasMany(DepositProductTerm::class);
    }

    public function baseTerm(): HasOne
    {
        return $this->hasOne(DepositProductTerm::class)->where('code', 'BASE');
    }
}