<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanProtectionProduct extends Model
{
    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'description',
        'monthly_rate_percent',
        'status',
    ];

    protected $casts = [
        'monthly_rate_percent' => 'decimal:4',
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(LoanApplication::class);
    }

    public function policies(): HasMany
    {
        return $this->hasMany(LoanProtectionPolicy::class);
    }
}