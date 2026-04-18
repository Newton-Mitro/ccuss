<?php

namespace App\BankCashModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankReconciliation extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'bank_account_id',
        'reconcile_date',
        'statement_balance',
        'system_balance',
        'notes',
    ];

    protected $casts = [
        'reconcile_date' => 'date',
        'statement_balance' => 'decimal:2',
        'system_balance' => 'decimal:2',
    ];

    // ------------------------
    // Relationships
    // ------------------------

    /**
     * Bank account this reconciliation belongs to
     */
    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    // ------------------------
    // Optional computed insights (nice for UX dashboards)
    // ------------------------

    public function getDifferenceAttribute(): float
    {
        return (float) ($this->statement_balance - $this->system_balance);
    }

    public function getIsMatchedAttribute(): bool
    {
        return (float) $this->statement_balance === (float) $this->system_balance;
    }
}