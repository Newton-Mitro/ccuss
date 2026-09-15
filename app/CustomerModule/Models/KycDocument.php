<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use App\Support\Traits\UppercaseEnumAttributes;
use Database\Factories\KycDocumentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class KycDocument extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;
    use UppercaseEnumAttributes;

    protected array $uppercaseEnumAttributes = ['document_type', 'verification_status'];

    protected $fillable = [
        'customer_id',

        'document_type',

        'file_name',
        'file_path',
        'mime',
        'alt_text',

        'verification_status',
        'verified_at',
        'remarks',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'url',
    ];

    /*
    |--------------------------------------------------------------------------
    | Document Types
    |--------------------------------------------------------------------------
    */

    public const NATIONAL_ID = 'NATIONAL_IDENTIFICATION_NUMBER';
    public const SMART_NID = 'SMART_NID';
    public const PASSPORT = 'PASSPORT';
    public const DRIVING_LICENSE = 'DRIVING_LICENSE';
    public const BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE';

    public const UTILITY_BILL = 'UTILITY_BILL';
    public const ELECTRICITY_BILL = 'ELECTRICITY_BILL';
    public const WATER_BILL = 'WATER_BILL';
    public const GAS_BILL = 'GAS_BILL';
    public const BANK_STATEMENT = 'BANK_STATEMENT';
    public const RENTAL_AGREEMENT = 'RENTAL_AGREEMENT';

    public const TIN_CERTIFICATE = 'TIN_CERTIFICATE';
    public const TAX_RETURN = 'TAX_RETURN';
    public const SALARY_SLIP = 'SALARY_SLIP';
    public const INCOME_CERTIFICATE = 'INCOME_CERTIFICATE';

    public const TRADE_LICENSE = 'TRADE_LICENSE';
    public const CERTIFICATE_OF_INCORPORATION = 'CERTIFICATE_OF_INCORPORATION';
    public const MEMORANDUM_OF_ASSOCIATION = 'MEMORANDUM_OF_ASSOCIATION';
    public const ARTICLES_OF_ASSOCIATION = 'ARTICLES_OF_ASSOCIATION';
    public const PARTNERSHIP_DEED = 'PARTNERSHIP_DEED';

    public const PHOTO = 'PHOTO';
    public const SIGNATURE = 'SIGNATURE';
    public const LIVE_SELFIE = 'LIVE_SELFIE';

    public const PEP_DECLARATION = 'PEP_DECLARATION';
    public const FATCA_FORM = 'FATCA_FORM';

    public const DOCUMENT_TYPES = [
        self::NATIONAL_ID,
        self::SMART_NID,
        self::PASSPORT,
        self::DRIVING_LICENSE,
        self::BIRTH_CERTIFICATE,
        self::UTILITY_BILL,
        self::ELECTRICITY_BILL,
        self::WATER_BILL,
        self::GAS_BILL,
        self::BANK_STATEMENT,
        self::RENTAL_AGREEMENT,
        self::TIN_CERTIFICATE,
        self::TAX_RETURN,
        self::SALARY_SLIP,
        self::INCOME_CERTIFICATE,
        self::TRADE_LICENSE,
        self::CERTIFICATE_OF_INCORPORATION,
        self::MEMORANDUM_OF_ASSOCIATION,
        self::ARTICLES_OF_ASSOCIATION,
        self::PARTNERSHIP_DEED,
        self::PHOTO,
        self::SIGNATURE,
        self::LIVE_SELFIE,
        self::PEP_DECLARATION,
        self::FATCA_FORM,
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

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getUrlAttribute(): ?string
    {
        return $this->file_path
            ? Storage::url($this->file_path)
            : null;
    }

    public function getDownloadUrlAttribute(): ?string
    {
        return $this->url;
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

    public function isPhoto(): bool
    {
        return $this->document_type === self::PHOTO;
    }

    public function isSignature(): bool
    {
        return $this->document_type === self::SIGNATURE;
    }

    public function isSelfie(): bool
    {
        return $this->document_type === self::LIVE_SELFIE;
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

    public function scopeType(Builder $query, string $type): Builder
    {
        return $query->where('document_type', $type);
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): KycDocumentFactory
    {
        return KycDocumentFactory::new();
    }
}