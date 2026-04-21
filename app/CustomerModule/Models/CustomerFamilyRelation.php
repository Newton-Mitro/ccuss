<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\CustomerFamilyRelationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerFamilyRelation extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'relative_id',
        'relation_type',

        'verification_status',
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

    public function relative(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'relative_id');
    }

    /* ========================
     * Helper Methods
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
        return CustomerFamilyRelationFactory::new();
    }
}