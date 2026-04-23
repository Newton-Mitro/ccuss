<?php

namespace App\TreasuryAndCashModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BranchDay extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'business_date',
        'opened_at',
        'closed_at',
        'status'
    ];

    protected $casts = [
        'business_date' => 'date',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function tellerSessions(): HasMany
    {
        return $this->hasMany(TellerSession::class);
    }
}