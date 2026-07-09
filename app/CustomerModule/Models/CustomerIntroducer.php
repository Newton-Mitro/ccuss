<?php

namespace App\CustomerModule\Models;

use App\AccountModule\Models\Account;
use App\SystemAdministration\Traits\Auditable;
use Database\Factories\CustomerIntroducerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerIntroducer extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;

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
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationship Types
    |--------------------------------------------------------------------------
    */

    public const FAMILY = 'family';
    public const FRIEND = 'friend';
    public const BUSINESS = 'business';
    public const COLLEAGUE = 'colleague';
    public const OTHER = 'other';

    public const RELATIONSHIP_TYPES = [
        self::FAMILY,
        self::FRIEND,
        self::BUSINESS,
        self::COLLEAGUE,
        self::OTHER,
    ];

    /*
    |--------------------------------------------------------------------------
    | Verification Status
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'pending';
    public const STATUS_VERIFIED = 'verified';
    public const STATUS_REJECTED = 'rejected';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * The customer who was introduced.
     */
    public function introducedCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'introduced_customer_id');
    }

    /**
     * The customer acting as the introducer.
     */
    public function introducerCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'introducer_customer_id');
    }

    /**
     * The account acting as the introducer.
     */
    public function introducerAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'introducer_account_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isVerified(): bool
    {
        return $this->verification_status === self::STATUS_VERIFIED;
    }

    public function isRejected(): bool
    {
        return $this->verification_status === self::STATUS_REJECTED;
    }

    public function isPending(): bool
    {
        return $this->verification_status === self::STATUS_PENDING;
    }

    public function isCustomerIntroducer(): bool
    {
        return $this->introducer_customer_id !== null;
    }

    public function isAccountIntroducer(): bool
    {
        return $this->introducer_account_id !== null;
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where(
            'verification_status',
            self::STATUS_VERIFIED
        );
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where(
            'verification_status',
            self::STATUS_PENDING
        );
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where(
            'verification_status',
            self::STATUS_REJECTED
        );
    }

    public function scopeRelationship(Builder $query, string $relationship): Builder
    {
        return $query->where('relationship_type', $relationship);
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): CustomerIntroducerFactory
    {
        return CustomerIntroducerFactory::new();
    }
}