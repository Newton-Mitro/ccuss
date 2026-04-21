<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\KycDocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class KycDocument extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'document_type',
        'file_name',
        'file_path',
        'mime',
        'alt_text',

        'verification_status',
        'verified_at',
        'remarks',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    protected $appends = ['url'];

    /* ========================
     * Core Relationships
     * ======================== */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /* ========================
     * Accessors
     * ======================== */

    public function getUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        return url(Storage::url($this->file_path));
    }

    /* ========================
     * Helpers
     * ======================== */

    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'rejected';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    protected static function newFactory()
    {
        return KycDocumentFactory::new();
    }
}