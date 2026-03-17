<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashAdjustment extends Model
{
    protected $fillable = [
        'teller_session_id',
        'amount',
        'type',
        'reason',
        'approved_by'
    ];

    /**
     * Link adjustment to the teller session instead of cash drawer
     */
    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    /**
     * Who approved this adjustment
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}