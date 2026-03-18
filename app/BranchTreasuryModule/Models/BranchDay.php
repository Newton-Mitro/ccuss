<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BranchDay extends Model
{
    protected $fillable = [
        'branch_id',
        'business_date',
        'opened_at',
        'closed_at',
        'opened_by',
        'closed_by',
        'status'
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function tellerSessions(): HasMany
    {
        return $this->hasMany(TellerSession::class);
    }
}