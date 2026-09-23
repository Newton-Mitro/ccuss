<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\CashCountDenomination;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashDenomination extends Model
{
    use HasFactory;

    protected $fillable = ['organization_id', 'currency', 'type', 'value', 'name', 'is_active', 'sort_order'];

    protected $casts = ['value' => 'decimal:4', 'is_active' => 'boolean'];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function countLines(): HasMany
    {
        return $this->hasMany(CashCountDenomination::class);
    }
}