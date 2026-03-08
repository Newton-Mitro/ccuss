<?php

namespace App\CostomerMgmt\Models;

use App\Audit\Traits\Auditable;
use App\UserRolePermissions\Models\User;
use Database\Factories\KycDocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class KycDocument extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'customer_id',
        'document_type',
        'file_name',
        'file_path',
        'mime',
        'alt_text',

        'verification_status',
        'verified_by',
        'verified_at',
        'remarks',

        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    protected $appends = ['url'];

    /* ========================
     * Relationships
     * ======================== */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
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
        return $this->verification_status === 'VERIFIED';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'REJECTED';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'PENDING';
    }

    protected static function newFactory()
    {
        return KycDocumentFactory::new();
    }
}