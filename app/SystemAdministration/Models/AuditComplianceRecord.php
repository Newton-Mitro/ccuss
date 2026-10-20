<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AuditComplianceRecord extends Model
{
    use Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'created_by',
        'updated_by',
        'related_record_id',
        'kind',
        'reference',
        'title',
        'category',
        'description',
        'status',
        'priority',
        'responsible_person',
        'due_date',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
            'metadata' => 'array',
        ];
    }

    public function relatedRecord(): BelongsTo
    {
        return $this->belongsTo(self::class, 'related_record_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
