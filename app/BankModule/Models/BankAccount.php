<?php

namespace App\BankModule\Models;

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
        'iban',
        'swift_code',
        'routing_number',
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
     * Balance is now delegated to central accounts table
     */
    public function getBalanceAttribute()
    {
        return $this->account?->balance ?? 0;
    }
}