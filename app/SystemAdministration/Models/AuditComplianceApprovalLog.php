<?php

namespace App\SystemAdministration\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

class AuditComplianceApprovalLog extends Model
{
    protected $fillable = [
        'organization_id',
        'record_id',
        'actor_id',
        'record_kind',
        'record_reference',
        'record_title',
        'action',
        'previous_status',
        'new_status',
        'comment',
        'ip_address',
        'acted_at',
    ];

    protected function casts(): array
    {
        return ['acted_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Approval decision logs are immutable.'));
        static::deleting(fn () => throw new LogicException('Approval decision logs are immutable.'));
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function record(): BelongsTo
    {
        return $this->belongsTo(AuditComplianceRecord::class, 'record_id');
    }
}
