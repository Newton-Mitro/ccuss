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

    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    public function cashDrawers(): HasMany
    {
        return $this->hasMany(CashDrawer::class);
    }

    public function vaultTransfers(): HasMany
    {
        return $this->hasMany(TellerVaultTransfer::class);
    }
}