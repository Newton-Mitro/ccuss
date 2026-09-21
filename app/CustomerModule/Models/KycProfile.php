<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use App\Support\Traits\UppercaseEnumAttributes;
use Database\Factories\KycProfileFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class KycProfile extends Model
{
    use HasFactory;
    use Auditable;
    use SoftDeletes;
    use UppercaseEnumAttributes;

    protected array $uppercaseEnumAttributes = ['kyc_level'];

    protected $fillable = [
        'customer_id',
        'primary_verified',
        'other_verified',
        'kyc_level',
    ];

    protected $casts = [
        'primary_verified' => 'integer',
        'other_verified' => 'integer',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | KYC Levels
    |--------------------------------------------------------------------------
    */

    public const LEVEL_MINIMAL = 'MINIMAL';
    public const LEVEL_BASIC = 'BASIC';
    public const LEVEL_STANDARD = 'STANDARD';
    public const LEVEL_FULL = 'FULL';
    public const LEVEL_ENHANCED = 'ENHANCED';

    public const LEVELS = [
        self::LEVEL_MINIMAL,
        self::LEVEL_BASIC,
        self::LEVEL_STANDARD,
        self::LEVEL_FULL,
        self::LEVEL_ENHANCED,
    ];

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
    | Level Helpers
    |--------------------------------------------------------------------------
    */

    public function isMinimal(): bool
    {
        return $this->kyc_level === self::LEVEL_MINIMAL;
    }

    public function isBasic(): bool
    {
        return $this->kyc_level === self::LEVEL_BASIC;
    }

    public function isStandard(): bool
    {
        return $this->kyc_level === self::LEVEL_STANDARD;
    }

    public function isFull(): bool
    {
        return $this->kyc_level === self::LEVEL_FULL;
    }

    public function isEnhanced(): bool
    {
        return $this->kyc_level === self::LEVEL_ENHANCED;
    }

    /*
    |--------------------------------------------------------------------------
    | Verification Score Helpers
    |--------------------------------------------------------------------------
    */

    public function isVerified(): bool
    {
        return $this->verificationValue > 0;
    }

    public function getVerificationValueAttribute(): int
    {
        return (int) $this->primary_verified + (int) $this->other_verified;
    }

    public function recalculateVerificationCounts(): self
    {
        $customerId = $this->customer_id;

        $hasPhoto = KycDocument::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', KycDocument::STATUS_VERIFIED)
            ->where('document_type', KycDocument::PHOTO)
            ->exists();

        $hasIdentificationDocument = KycDocument::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', KycDocument::STATUS_VERIFIED)
            ->whereIn('document_type', [
                KycDocument::NATIONAL_ID,
                KycDocument::SMART_NID,
                KycDocument::PASSPORT,
                KycDocument::DRIVING_LICENSE,
                KycDocument::BIRTH_CERTIFICATE,
                KycDocument::TRADE_LICENSE,
                KycDocument::CERTIFICATE_OF_INCORPORATION,
                KycDocument::MEMORANDUM_OF_ASSOCIATION,
                KycDocument::ARTICLES_OF_ASSOCIATION,
                KycDocument::PARTNERSHIP_DEED,
            ])
            ->exists();

        $isOrganization = $this->customer()->where(
            'type',
            Customer::TYPE_ORGANIZATION,
        )->exists();

        $primaryAddresses = CustomerAddress::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerAddress::STATUS_VERIFIED)
            ->whereIn('type', [CustomerAddress::TYPE_CURRENT, CustomerAddress::TYPE_PERMANENT])
            ->count();

        $otherAddresses = CustomerAddress::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerAddress::STATUS_VERIFIED)
            ->whereNotIn('type', [CustomerAddress::TYPE_CURRENT, CustomerAddress::TYPE_PERMANENT])
            ->count();

        $primaryRelations = $isOrganization ? 0 : CustomerFamilyRelation::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerFamilyRelation::STATUS_VERIFIED)
            ->whereIn('relation_type', [CustomerFamilyRelation::FATHER, CustomerFamilyRelation::MOTHER])
            ->count();

        $otherRelations = $isOrganization ? 0 : CustomerFamilyRelation::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerFamilyRelation::STATUS_VERIFIED)
            ->whereNotIn('relation_type', [CustomerFamilyRelation::FATHER, CustomerFamilyRelation::MOTHER])
            ->count();

        $verifiedIntroducers = CustomerIntroducer::query()
            ->where('introduced_customer_id', $customerId)
            ->where('verification_status', CustomerIntroducer::STATUS_VERIFIED)
            ->count();

        $hasVerifiedIntroducer = $verifiedIntroducers > 0;

        $hasCurrentAddress = CustomerAddress::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerAddress::STATUS_VERIFIED)
            ->where('type', CustomerAddress::TYPE_CURRENT)
            ->exists();

        $hasPermanentAddress = CustomerAddress::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerAddress::STATUS_VERIFIED)
            ->where('type', CustomerAddress::TYPE_PERMANENT)
            ->exists();

        $hasFamilyRelation = !$isOrganization && CustomerFamilyRelation::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', CustomerFamilyRelation::STATUS_VERIFIED)
            ->exists();

        $primaryDocuments = KycDocument::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', KycDocument::STATUS_VERIFIED)
            ->whereIn('document_type', KycDocument::PRIMARY_DOCUMENT_TYPES)
            ->count();

        $otherDocuments = KycDocument::query()
            ->where('customer_id', $customerId)
            ->where('verification_status', KycDocument::STATUS_VERIFIED)
            ->whereNotIn('document_type', KycDocument::PRIMARY_DOCUMENT_TYPES)
            ->count();

        $hasAdditionalDocument = $otherDocuments > 0;

        $kycLevel = self::LEVEL_MINIMAL;

        if ($hasPhoto && $hasIdentificationDocument) {
            $kycLevel = self::LEVEL_BASIC;
        }

        if ($kycLevel === self::LEVEL_BASIC && $hasCurrentAddress && $hasPermanentAddress) {
            $kycLevel = self::LEVEL_STANDARD;
        }

        if ($kycLevel === self::LEVEL_STANDARD && $hasVerifiedIntroducer) {
            $kycLevel = self::LEVEL_FULL;
        }

        if ($kycLevel === self::LEVEL_FULL && ($hasFamilyRelation || $hasAdditionalDocument)) {
            $kycLevel = self::LEVEL_ENHANCED;
        }

        $this->update([
            'primary_verified' => $primaryAddresses
                + $primaryRelations
                + $verifiedIntroducers
                + $primaryDocuments,
            'other_verified' => $otherAddresses + $otherRelations + $otherDocuments,
            'kyc_level' => $kycLevel,
        ]);

        return $this;
    }

    public function canTransact(): bool
    {
        return in_array($this->kyc_level, [
            self::LEVEL_STANDARD,
            self::LEVEL_FULL,
            self::LEVEL_ENHANCED,
        ], true);
    }

    public function isFullyVerified(): bool
    {
        return in_array($this->kyc_level, [
            self::LEVEL_FULL,
            self::LEVEL_ENHANCED,
        ], true);
    }

    public function completionPercentage(): int
    {
        return min(
            100,
            (int) round(($this->verificationValue / 15) * 100)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeLevel(Builder $query, string $level): Builder
    {
        return $query->where('kyc_level', $level);
    }

    public function scopeMinimal(Builder $query): Builder
    {
        return $query->where('kyc_level', self::LEVEL_MINIMAL);
    }

    public function scopeBasic(Builder $query): Builder
    {
        return $query->where('kyc_level', self::LEVEL_BASIC);
    }

    public function scopeStandard(Builder $query): Builder
    {
        return $query->where('kyc_level', self::LEVEL_STANDARD);
    }

    public function scopeFull(Builder $query): Builder
    {
        return $query->where('kyc_level', self::LEVEL_FULL);
    }

    public function scopeEnhanced(Builder $query): Builder
    {
        return $query->where('kyc_level', self::LEVEL_ENHANCED);
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): KycProfileFactory
    {
        return KycProfileFactory::new();
    }
}