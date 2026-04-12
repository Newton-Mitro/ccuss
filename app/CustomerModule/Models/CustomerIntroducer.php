<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerIntroducer extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'introduced_customer_id',
        'introducer_customer_id',
        'introducer_account_id',

        'relationship_type',

        'verification_status',
        'verified_at',
        'remarks',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];


    /* ========================
     * Customer Relationships
     * ======================== */

    // The customer who was introduced
    public function introducedCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'introduced_customer_id');
    }

    // The customer who introduced someone
    public function introducer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'introducer_customer_id');
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
}