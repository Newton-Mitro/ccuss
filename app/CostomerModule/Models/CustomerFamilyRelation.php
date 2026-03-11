<?php

namespace App\CostomerModule\Models;

use App\Audit\Traits\Auditable;
use App\UserRolePermissions\Models\User;
use Database\Factories\CustomerFamilyRelationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerFamilyRelation extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'customer_id',
        'relative_id',
        'relation_type',

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

    /* ========================
     * Relationships
     * ======================== */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function relative(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'relative_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /* ========================
     * Helper Methods
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
        return CustomerFamilyRelationFactory::new();
    }
}