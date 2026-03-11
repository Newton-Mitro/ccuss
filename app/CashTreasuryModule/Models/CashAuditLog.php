<?php

namespace App\CashTreasuryModule\Models;

use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashAuditLog extends Model
{
    protected $fillable = [
        'cash_drawer_id',
        'user_id',
        'action',
        'details',
        'action_time'
    ];

    public function cashDrawer(): BelongsTo
    {
        return $this->belongsTo(CashDrawer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}