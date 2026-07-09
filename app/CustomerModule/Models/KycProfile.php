<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
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

    protected $fillable = [
        'customer_id',
        'verification_value',
        'kyc_level',
    ];

    protected $casts = [
        'verification_value' => 'integer',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | KYC Levels
    |--------------------------------------------------------------------------
    */

    public const LEVEL_MINIMAL = 'minimal';
    public const LEVEL_BASIC = 'basic';
    public const LEVEL_STANDARD = 'standard';
    public const LEVEL_FULL = 'full';
    public const LEVEL_ENHANCED = 'enhanced';

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
        return $this->verification_value > 0;
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
            (int) round(($this->verification_value / 15) * 100)
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