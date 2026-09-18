<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\BankAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bank extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'short_name',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }
}
