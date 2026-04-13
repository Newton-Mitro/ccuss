<?php

namespace App\BankModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankAccount extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
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
    ];

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

    // ------------------------
    // Relationships
    // ------------------------

    /**
     * Bank reconciliations for this account
     */
    public function reconciliations()
    {
        return $this->hasMany(BankReconciliation::class);
    }
}