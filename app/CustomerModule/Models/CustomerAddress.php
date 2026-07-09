<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\CustomerAddressFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerAddress extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;

    protected $fillable = [
        'customer_id',

        'line1',
        'line2',

        'division',
        'district',
        'upazila',
        'union_ward',
        'postal_code',
        'country',

        'type',

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
    | Address Types
    |--------------------------------------------------------------------------
    */

    public const TYPE_CURRENT = 'current';
    public const TYPE_PERMANENT = 'permanent';
    public const TYPE_MAILING = 'mailing';
    public const TYPE_WORK = 'work';
    public const TYPE_REGISTERED = 'registered';
    public const TYPE_OTHER = 'other';

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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
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

    public function isPending(): bool
    {
        return $this->verification_status === self::STATUS_PENDING;
    }

    public function isRejected(): bool
    {
        return $this->verification_status === self::STATUS_REJECTED;
    }

    public function fullAddress(): string
    {
        return collect([
            $this->line1,
            $this->line2,
            $this->union_ward,
            $this->upazila,
            $this->district,
            $this->division,
            $this->postal_code,
            $this->country,
        ])
            ->filter()
            ->implode(', ');
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

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_CURRENT);
    }

    public function scopePermanent(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_PERMANENT);
    }

    public function scopeMailing(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_MAILING);
    }

    public function getDisplayAddressAttribute(): string
    {
        return $this->fullAddress();
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): CustomerAddressFactory
    {
        return CustomerAddressFactory::new();
    }
}