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

    // 🔗 Direct children
    public function children(): HasMany
    {
        return $this->hasMany(LedgerAccount::class, 'parent_id')->orderBy('code');
    }

    // 🔗 Parent
    public function parent(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'parent_id');
    }

    // 🧠 Recursive children for hierarchy
    public function childrenRecursive()
    {
        return $this->children()->with(['childrenRecursive', 'balances']);
    }

    // Voucher lines
    public function voucherLines(): HasMany
    {
        return $this->hasMany(VoucherLine::class);
    }

    // All balances
    public function balances(): HasMany
    {
        return $this->hasMany(LedgerAccountBalance::class);
    }

    // 🔹 Get balance for a specific fiscal period
    public function balanceForPeriod($periodId)
    {
        return $this->hasOne(LedgerAccountBalance::class)
            ->where('accounting_period_id', $periodId);
    }

    // 🔹 Get balances filtered by fiscal year or period dynamically
    public function balancesForFilter($fiscalYearId = null, $fiscalPeriodId = null)
    {
        return $this->hasMany(LedgerAccountBalance::class)
            ->when($fiscalYearId, function ($q) use ($fiscalYearId) {
                $q->whereHas('fiscalPeriod', fn($p) => $p->where('fiscal_year_id', $fiscalYearId));
            })
            ->when($fiscalPeriodId, fn($q) => $q->where('accounting_period_id', $fiscalPeriodId));
    }

    // 🔹 Recursive balances including children
    public function recursiveBalances($fiscalYearId = null, $fiscalPeriodId = null)
    {
        $balanceSum = $this->balancesForFilter($fiscalYearId, $fiscalPeriodId)->sum('amount');

        if ($this->children_recursive) {
            foreach ($this->children_recursive as $child) {
                $balanceSum += $child->recursiveBalances($fiscalYearId, $fiscalPeriodId);
            }
        }

        return $balanceSum;
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