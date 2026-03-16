<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashDrawer extends Model
{
    protected $fillable = ['teller_session_id', 'vault_id', 'opening_balance', 'closing_balance'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class, 'teller_session_id');
    }

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class);
    }

    public function balancings(): HasMany
    {
        return $this->hasMany(CashBalancing::class);
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(CashAdjustment::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(CashAuditLog::class);
    }
}