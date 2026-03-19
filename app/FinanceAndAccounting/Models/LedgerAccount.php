<?php

namespace App\FinanceAndAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use App\SystemAdministration\Models\Organization;
use Database\Factories\LedgerAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerAccount extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'type',
        'is_control_account',
        'requires_subledger',
        'is_active',
        'is_leaf',
        'parent_id',
    ];

    protected $casts = [
        'is_control_account' => 'boolean',
        'requires_subledger' => 'boolean',
        'is_active' => 'boolean',
        'is_leaf' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    // Parent account
    public function parent(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'parent_id');
    }

    // Direct children
    public function children(): HasMany
    {
        return $this->hasMany(LedgerAccount::class, 'parent_id')->orderBy('code');
    }

    // Recursive tree
    public function childrenRecursive()
    {
        return $this->children()->with(['childrenRecursive', 'balances']);
    }

    // Voucher lines
    public function voucherLines(): HasMany
    {
        return $this->hasMany(VoucherLine::class);
    }

    // Account balances
    public function balances(): HasMany
    {
        return $this->hasMany(LedgerAccountBalance::class);
    }

    // Balance for a specific period
    public function balanceForPeriod($periodId)
    {
        return $this->hasOne(LedgerAccountBalance::class)
            ->where('accounting_period_id', $periodId);
    }

    // Dynamic balance filter
    public function balancesForFilter($fiscalYearId = null, $fiscalPeriodId = null)
    {
        return $this->hasMany(LedgerAccountBalance::class)
            ->when($fiscalYearId, function ($q) use ($fiscalYearId) {
                $q->whereHas(
                    'fiscalPeriod',
                    fn($p) =>
                    $p->where('fiscal_year_id', $fiscalYearId)
                );
            })
            ->when(
                $fiscalPeriodId,
                fn($q) =>
                $q->where('accounting_period_id', $fiscalPeriodId)
            );
    }

    // Recursive balance calculation
    public function recursiveBalances($fiscalYearId = null, $fiscalPeriodId = null)
    {
        $balanceSum = $this->balancesForFilter($fiscalYearId, $fiscalPeriodId)->sum('amount');

        if ($this->childrenRecursive) {
            foreach ($this->childrenRecursive as $child) {
                $balanceSum += $child->recursiveBalances($fiscalYearId, $fiscalPeriodId);
            }
        }

        return $balanceSum;
    }

    /*
    |--------------------------------------------------------------------------
    | Model Events
    |--------------------------------------------------------------------------
    */

    protected static function booted()
    {
        static::saving(function ($account) {
            // Control accounts are not leaf nodes
            $account->is_leaf = !$account->is_control_account;
        });

        static::created(function ($account) {
            if ($account->parent_id) {
                self::where('id', $account->parent_id)
                    ->update([
                        'is_leaf' => false,
                        'is_control_account' => true,
                    ]);
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): LedgerAccountFactory
    {
        return LedgerAccountFactory::new();
    }
}