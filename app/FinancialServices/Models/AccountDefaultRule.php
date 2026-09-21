<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\AccountDefaultEvent;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountDefaultRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'financial_product_id',
        'account_type',
        'name',
        'grace_days',
        'fine_calculation',
        'fine_amount',
        'fine_rate',
        'extends_maturity',
        'maturity_extension_days',
        'is_active',
    ];

    protected $casts = [
        'fine_amount' => 'decimal:4',
        'fine_rate' => 'decimal:6',
        'extends_maturity' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }

    public function defaultEvents(): HasMany
    {
        return $this->hasMany(AccountDefaultEvent::class);
    }
}
