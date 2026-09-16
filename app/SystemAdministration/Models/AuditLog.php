<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Support\Traits\UppercaseEnumAttributes;

class AuditLog extends Model
{
    use UppercaseEnumAttributes;

    protected array $uppercaseEnumAttributes = ['event'];
    public const EVENT_CREATED = 'CREATED';
    public const EVENT_UPDATED = 'UPDATED';
    public const EVENT_DELETED = 'DELETED';

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'batch_id',
        'user_id',
        'organization_id',
        'event',
        'old_values',
        'new_values',
        'url',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}