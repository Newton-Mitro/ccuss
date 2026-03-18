<?php

namespace App\CustomerModule\Models;

use App\Audit\Traits\Auditable;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use Database\Factories\KycProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycProfile extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'customer_id',
        'kyc_level',
        'risk_level',
        'verification_status',
        'verified_by',
        'verified_at',
        'remarks',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    /* ========================
     * Core Relationships
     * ======================== */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /* ========================
     * Verification
     * ======================== */

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /* ========================
     * Helper Methods
     * ======================== */

    public function isApproved(): bool
    {
        return $this->verification_status === 'APPROVED';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'REJECTED';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'PENDING';
    }

    public function isHighRisk(): bool
    {
        return $this->risk_level === 'HIGH';
    }

    public function isMediumRisk(): bool
    {
        return $this->risk_level === 'MEDIUM';
    }

    public function isLowRisk(): bool
    {
        return $this->risk_level === 'LOW';
    }

    protected static function newFactory()
    {
        return KycProfileFactory::new();
    }
}