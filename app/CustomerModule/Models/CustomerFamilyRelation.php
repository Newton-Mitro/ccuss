<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use App\Support\Traits\UppercaseEnumAttributes;
use Database\Factories\CustomerFamilyRelationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerFamilyRelation extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;
    use UppercaseEnumAttributes;

    protected array $uppercaseEnumAttributes = ['relation_type', 'verification_status'];

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
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relation Types
    |--------------------------------------------------------------------------
    */

    public const FATHER = 'FATHER';
    public const MOTHER = 'MOTHER';
    public const SON = 'SON';
    public const DAUGHTER = 'DAUGHTER';
    public const BROTHER = 'BROTHER';
    public const SISTER = 'SISTER';
    public const HUSBAND = 'HUSBAND';
    public const WIFE = 'WIFE';
    public const GRANDFATHER = 'GRANDFATHER';
    public const GRANDMOTHER = 'GRANDMOTHER';
    public const UNCLE = 'UNCLE';
    public const AUNT = 'AUNT';
    public const NEPHEW = 'NEPHEW';
    public const NIECE = 'NIECE';
    public const FATHER_IN_LAW = 'FATHER_IN_LAW';
    public const MOTHER_IN_LAW = 'MOTHER_IN_LAW';
    public const SON_IN_LAW = 'SON_IN_LAW';
    public const DAUGHTER_IN_LAW = 'DAUGHTER_IN_LAW';
    public const BROTHER_IN_LAW = 'BROTHER_IN_LAW';
    public const SISTER_IN_LAW = 'SISTER_IN_LAW';

    public const RELATION_TYPES = [
        self::FATHER,
        self::MOTHER,
        self::SON,
        self::DAUGHTER,
        self::BROTHER,
        self::SISTER,
        self::HUSBAND,
        self::WIFE,
        self::GRANDFATHER,
        self::GRANDMOTHER,
        self::UNCLE,
        self::AUNT,
        self::NEPHEW,
        self::NIECE,
        self::FATHER_IN_LAW,
        self::MOTHER_IN_LAW,
        self::SON_IN_LAW,
        self::DAUGHTER_IN_LAW,
        self::BROTHER_IN_LAW,
        self::SISTER_IN_LAW,
    ];

    /*
    |--------------------------------------------------------------------------
    | Verification Status
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_VERIFIED = 'VERIFIED';
    public const STATUS_REJECTED = 'REJECTED';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function relative(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'relative_id');
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

    public function isParent(): bool
    {
        return in_array($this->relation_type, [
            self::FATHER,
            self::MOTHER,
        ], true);
    }

    public function isChild(): bool
    {
        return in_array($this->relation_type, [
            self::SON,
            self::DAUGHTER,
        ], true);
    }

    public function isSibling(): bool
    {
        return in_array($this->relation_type, [
            self::BROTHER,
            self::SISTER,
        ], true);
    }

    public function isSpouse(): bool
    {
        return in_array($this->relation_type, [
            self::HUSBAND,
            self::WIFE,
        ], true);
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

    public function scopeRelation(Builder $query, string $relation): Builder
    {
        return $query->where('relation_type', $relation);
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): CustomerFamilyRelationFactory
    {
        return CustomerFamilyRelationFactory::new();
    }
}