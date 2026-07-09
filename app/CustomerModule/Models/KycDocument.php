<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
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

    public const NATIONAL_ID = 'national_identification_number';
    public const SMART_NID = 'smart_nid';
    public const PASSPORT = 'passport';
    public const DRIVING_LICENSE = 'driving_license';
    public const BIRTH_CERTIFICATE = 'birth_certificate';

    public const UTILITY_BILL = 'utility_bill';
    public const ELECTRICITY_BILL = 'electricity_bill';
    public const WATER_BILL = 'water_bill';
    public const GAS_BILL = 'gas_bill';
    public const BANK_STATEMENT = 'bank_statement';
    public const RENTAL_AGREEMENT = 'rental_agreement';

    public const TIN_CERTIFICATE = 'tin_certificate';
    public const TAX_RETURN = 'tax_return';
    public const SALARY_SLIP = 'salary_slip';
    public const INCOME_CERTIFICATE = 'income_certificate';

    public const TRADE_LICENSE = 'trade_license';
    public const CERTIFICATE_OF_INCORPORATION = 'certificate_of_incorporation';
    public const MEMORANDUM_OF_ASSOCIATION = 'memorandum_of_association';
    public const ARTICLES_OF_ASSOCIATION = 'articles_of_association';
    public const PARTNERSHIP_DEED = 'partnership_deed';

    public const PHOTO = 'photo';
    public const SIGNATURE = 'signature';
    public const LIVE_SELFIE = 'live_selfie';

    public const PEP_DECLARATION = 'pep_declaration';
    public const FATCA_FORM = 'fatca_form';

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