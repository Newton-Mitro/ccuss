<?php

namespace App\BankCashModule\Models;

use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankAccount extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'account_id',
        'bank_name',
        'branch_name',
        'account_number',
        'swift_code',
        'routing_number',
        'status', // ✅ added
    ];

    protected $casts = [
        'status' => 'string', // or keep as string for enum
    ];

    protected $appends = [
        'display_name',
        'account_type_label',
        'account_type_class',
        'balance',
    ];

    // ------------------------
    // Relationships
    // ------------------------

    /**
     * Core ledger account (single source of truth for balance)
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Bank reconciliations for this account
     */
    public function reconciliations()
    {
        return $this->hasMany(BankReconciliation::class);
    }

    // ------------------------
    // Scopes (🔥 Highly Recommended)
    // ------------------------

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    // ------------------------
    // Accessors
    // ------------------------

    public function getDisplayNameAttribute(): string
    {
        return "{$this->bank_name} - {$this->account_number}";
    }

    public function getAccountTypeLabelAttribute(): string
    {
        return 'Bank Account';
    }

    public function getAccountTypeClassAttribute(): string
    {
        return self::class;
    }

    /**
     * Balance is delegated to central accounts table
     */
    public function getBalanceAttribute()
    {
        return $this->account?->balance ?? 0;
    }

    /**
     * Optional: Human readable status (for UI)
     */
    public function getStatusLabelAttribute(): string
    {
        return ucfirst($this->status);
    }
}