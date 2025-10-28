<?php

namespace App\Media\Models;

use App\Models\User;
use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_name',
        'file_path',
        'file_type',
        'alt_text',
        'uploaded_by',
        'updated_by',
    ];

    protected $appends = ['url'];

    /**
     * User who uploaded the media
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * User who last updated the media
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getUrlAttribute(): string
    {
        // If using public disk
        return url(Storage::url($this->file_path));
    }

    protected static function newFactory()
    {
        return MediaFactory::new();
    }
}
