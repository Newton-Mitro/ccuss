<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashAuditLog extends Model
{
    protected $fillable = [
        'teller_session_id',
        'user_id',
        'action',
        'details',
        'action_time'
    ];

    /**
     * Link the audit log to a teller session
     */
    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    /**
     * The user who performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}