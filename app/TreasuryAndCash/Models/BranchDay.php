<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'business_date',
        'status',
        'opened_at',
        'closed_at',
        'opened_by',
        'closed_by',
        'opening_note',
        'closing_note',
    ];

    protected $casts = [
        'business_date' => 'date:Y-m-d',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public const STATUS_OPEN = 'OPEN';
    public const STATUS_CLOSING = 'CLOSING';
    public const STATUS_CLOSED = 'CLOSED';

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
}
