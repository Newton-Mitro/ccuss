<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanAccount;
use App\SystemAdministration\Traits\Auditable;
use App\Support\Traits\UppercaseEnumAttributes;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;
    use UppercaseEnumAttributes;

    protected array $uppercaseEnumAttributes = [
        'type',
        'identification_type',
        'gender',
        'marital_status',
        'blood_group',
        'religion',
        'status',
    ];

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

    public const TYPE_INDIVIDUAL = 'INDIVIDUAL';
    public const TYPE_ORGANIZATION = 'ORGANIZATION';

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_INACTIVE = 'INACTIVE';
    public const STATUS_SUSPENDED = 'SUSPENDED';
    public const STATUS_CLOSED = 'CLOSED';

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
            ->where('type', CustomerAddress::TYPE_CURRENT);
    }

    public function permanentAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', CustomerAddress::TYPE_PERMANENT);
    }

    public function mailingAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', CustomerAddress::TYPE_MAILING);
    }

    public function workAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)
            ->where('type', CustomerAddress::TYPE_WORK);
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

    public function depositAccounts(): HasMany
    {
        return $this->hasMany(FinancialAccount::class, 'holder_id')
            ->where('holder_type', self::class)
            ->whereIn('account_type', ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT']);
    }

    public function loanAccounts(): HasMany
    {
        return $this->hasMany(LoanAccount::class);
    }

    public function heldDepositAccounts(): BelongsToMany
    {
        return $this->belongsToMany(
            FinancialAccount::class,
            'deposit_account_holders',
            'customer_id',
            'financial_account_id',
        )
            ->withPivot(['role', 'ownership_percent', 'guardian_customer_id'])
            ->withTimestamps();
    }

    public function photo(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', KycDocument::PHOTO);
    }

    public function signature(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', KycDocument::SIGNATURE);
    }

    public function selfie(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', KycDocument::LIVE_SELFIE);
    }

    public function nationalId(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', KycDocument::NATIONAL_ID);
    }

    public function passport(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', KycDocument::PASSPORT);
    }

    public function tradeLicense(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', KycDocument::TRADE_LICENSE);
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