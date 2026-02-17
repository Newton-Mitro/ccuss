<?php

namespace App\Accounting\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'is_control_account',
        'is_active',
        'is_leaf',
        'parent_id',
    ];

    protected $casts = [
        'is_control_account' => 'boolean',
        'is_active' => 'boolean',
        'is_leaf' => 'boolean',
    ];

    // 🔗 Parent relation
    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id')->orderBy('code');
    }

    // Parent relationship
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    // 🧠 Recursive relationship (optional for full hierarchy)
    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function voucherLines(): HasMany
    {
        return $this->hasMany(VoucherLine::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(AccountBalance::class);
    }
}