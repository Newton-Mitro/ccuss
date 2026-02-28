<?php

namespace App\Accounting\Models;

use App\Audit\Traits\Auditable;
use Database\Factories\LedgerAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerAccount extends Model
{
    use HasFactory, Auditable;

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
        return $this->hasMany(LedgerAccount::class, 'parent_id')->orderBy('code');
    }

    // Parent relationship
    public function parent(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'parent_id');
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
        return $this->hasMany(LedgerAccountBalance::class);
    }

    protected static function booted()
    {
        static::saving(function ($account) {
            // Control accounts are never leaf nodes
            $account->is_leaf = !$account->is_control_account;
        });

        static::created(function ($account) {
            // If this account has a parent, parent can’t be a leaf
            if ($account->parent_id) {
                self::where('id', $account->parent_id)
                    ->update([
                        'is_leaf' => false,
                        'is_control_account' => true,
                    ]);
            }
        });
    }

    protected static function newFactory()
    {
        return LedgerAccountFactory::new();
    }
}