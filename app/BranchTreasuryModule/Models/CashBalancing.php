<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashBalancing extends Model
{
    protected $fillable = [
        'teller_session_id',
        'expected_balance',
        'actual_balance',
        'difference',
        'verified_by',
        'balanced_at',
        'remarks'
    ];

    /**
     * Link the balancing record to a teller session
     */
    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    /**
     * User who verified the balancing
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}