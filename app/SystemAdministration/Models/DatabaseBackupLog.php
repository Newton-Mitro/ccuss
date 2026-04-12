<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class DatabaseBackupLog extends Model
{
    use Auditable;
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