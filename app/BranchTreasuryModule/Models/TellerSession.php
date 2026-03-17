<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TellerSession extends Model
{
    protected $fillable = [
        'teller_id',
        'branch_day_id',
        'opening_cash',
        'closing_cash',
        'opened_at',
        'closed_at',
        'status'
    ];

    /**
     * Teller linked to this session
     */
    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }

    /**
     * Branch day linked to this session
     */
    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    /**
     * All cash transactions for this session
     */
    public function cashTransactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class);
    }

    /**
     * All cash adjustments for this session
     */
    public function cashAdjustments(): HasMany
    {
        return $this->hasMany(CashAdjustment::class);
    }

    /**
     * All cash balancings for this session
     */
    public function cashBalancings(): HasMany
    {
        return $this->hasMany(CashBalancing::class);
    }

    /**
     * All audit logs for this session
     */
    public function cashAuditLogs(): HasMany
    {
        return $this->hasMany(CashAuditLog::class);
    }

    /**
     * Vault transfers involving this session
     */
    public function vaultTransfers(): HasMany
    {
        return $this->hasMany(TellerVaultTransfer::class);
    }
}