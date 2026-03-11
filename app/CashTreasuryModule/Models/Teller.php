<?php

namespace App\CashTreasuryModule\Models;

use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teller extends Model
{
    protected $fillable = ['user_id', 'branch_id', 'code', 'name', 'is_active'];

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