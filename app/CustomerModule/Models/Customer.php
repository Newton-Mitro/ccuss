<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;

    protected $fillable = [
        'organization_id',
        'branch_id',

        'customer_no',
        'type',
        'name',

        'primary_phone',
        'alternate_phone',

        'primary_email',
        'alternate_email',

        'identification_type',
        'identification_number',

        'dob',
        'gender',
        'marital_status',
        'blood_group',
        'nationality',
        'occupation',
        'education',
        'religion',

        'status',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Types
    |--------------------------------------------------------------------------
    */

    public const TYPE_INDIVIDUAL = 'individual';
    public const TYPE_ORGANIZATION = 'organization';

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_CLOSED = 'closed';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Addresses
    |--------------------------------------------------------------------------
    */

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function currentAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', 'current');
    }

    public function permanentAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', 'permanent');
    }

    public function mailingAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', 'mailing');
    }

    public function workAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', 'work');
    }

    /*
    |--------------------------------------------------------------------------
    | Family
    |--------------------------------------------------------------------------
    */

    public function familyRelations(): HasMany
    {
        return $this->hasMany(CustomerFamilyRelation::class);
    }

    public function relatedToMe(): HasMany
    {
        return $this->hasMany(CustomerFamilyRelation::class, 'relative_id');
    }

    /*
    |--------------------------------------------------------------------------
    | KYC
    |--------------------------------------------------------------------------
    */

    public function kycProfile(): HasOne
    {
        return $this->hasOne(KycProfile::class);
    }

    public function kycDocuments(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }

    public function photo(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'photo');
    }

    public function signature(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'signature');
    }

    public function selfie(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'live_selfie');
    }

    public function nationalId(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'national_identification_number');
    }

    public function passport(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'passport');
    }

    public function tradeLicense(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'trade_license');
    }

    /*
    |--------------------------------------------------------------------------
    | Introducers
    |--------------------------------------------------------------------------
    */

    public function introducers(): HasMany
    {
        return $this->hasMany(
            CustomerIntroducer::class,
            'introduced_customer_id'
        );
    }

    public function introducedCustomers(): HasMany
    {
        return $this->hasMany(
            CustomerIntroducer::class,
            'introducer_customer_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Online Services
    |--------------------------------------------------------------------------
    */

    public function onlineServiceClient(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isIndividual(): bool
    {
        return $this->type === self::TYPE_INDIVIDUAL;
    }

    public function isOrganization(): bool
    {
        return $this->type === self::TYPE_ORGANIZATION;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeIndividuals(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_INDIVIDUAL);
    }

    public function scopeOrganizations(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_ORGANIZATION);
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): CustomerFactory
    {
        return CustomerFactory::new();
    }
}