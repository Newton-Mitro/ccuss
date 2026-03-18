<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teller extends Model
{
    // ✅ Add new numeric fields to fillable
    protected $fillable = [
        'user_id',
        'branch_id',
        'code',
        'name',
        'max_cash_limit',
        'max_transaction_limit',
        'is_active',
    ];

    // ✅ Cast numeric fields and boolean
    protected $casts = [
        'max_cash_limit' => 'float',
        'max_transaction_limit' => 'float',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TellerSession::class);
    }

    public function limits(): HasMany
    {
        return $this->hasMany(TellerLimit::class);
    }
}