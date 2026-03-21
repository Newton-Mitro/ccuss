<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\KycProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycProfile extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'customer_id',
        'kyc_level',
        'risk_level',
    ];

    /* ========================
     * Constants (Enums)
     * ======================== */
    public const LEVEL_BASIC = 'BASIC';
    public const LEVEL_FULL = 'FULL';
    public const LEVEL_ENHANCED = 'ENHANCED';

    public const RISK_LOW = 'LOW';
    public const RISK_MEDIUM = 'MEDIUM';
    public const RISK_HIGH = 'HIGH';

    /* ========================
     * Relationships
     * ======================== */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /* ========================
     * Helpers - Level
     * ======================== */
    public function isBasic(): bool
    {
        return $this->kyc_level === self::LEVEL_BASIC;
    }

    public function isFull(): bool
    {
        return $this->kyc_level === self::LEVEL_FULL;
    }

    public function isEnhanced(): bool
    {
        return $this->kyc_level === self::LEVEL_ENHANCED;
    }

    /* ========================
     * Helpers - Risk
     * ======================== */
    public function isLowRisk(): bool
    {
        return $this->risk_level === self::RISK_LOW;
    }

    public function isMediumRisk(): bool
    {
        return $this->risk_level === self::RISK_MEDIUM;
    }

    public function isHighRisk(): bool
    {
        return $this->risk_level === self::RISK_HIGH;
    }
    protected static function newFactory()
    {
        return KycProfileFactory::new();
    }
}