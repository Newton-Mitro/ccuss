<?php

namespace App\SystemAdministration\Models;

use Illuminate\Database\Eloquent\Model;
use App\Support\Traits\UppercaseEnumAttributes;

class DatabaseBackupLog extends Model
{
    use UppercaseEnumAttributes;

    protected array $uppercaseEnumAttributes = ['backup_type', 'status'];
    public const TYPE_FULL = 'FULL';
    public const TYPE_DATABASE_ONLY = 'DATABASE_ONLY';
    public const TYPE_FILES_ONLY = 'FILES_ONLY';

    public const STATUS_RUNNING = 'RUNNING';
    public const STATUS_SUCCESS = 'SUCCESS';
    public const STATUS_FAILED = 'FAILED';

    protected $fillable = [
        'file_name',
        'file_path',
        'file_size',
        'backup_type',
        'storage_disk',
        'status',
        'checksum',
        'duration_seconds',
        'message',
        'error',
        'created_by',
        'started_at',
        'completed_at',
    ];
}