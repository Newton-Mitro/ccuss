<?php

namespace App\SubledgerModule\Models;

use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Database\Factories\SubledgerAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubledgerAccount extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'subledger_id',
        'accountable_type',
        'accountable_id',
        'account_number',
        'name',
        'status',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function accountable(): MorphTo
    {
        return $this->morphTo();
    }

    public function subledger(): BelongsTo
    {
        return $this->belongsTo(Subledger::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function holders(): HasMany
    {
        return $this->hasMany(AccountHolder::class);
    }

    public function nominees(): HasMany
    {
        return $this->hasMany(AccountNominee::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(AccountBalance::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeBySubledger($query, $subledgerId)
    {
        return $query->where('subledger_id', $subledgerId);
    }

    /*
    |--------------------------------------------------------------------------
    | Status Constants (Aligned with DB enum)
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_DORMANT = 'dormant';
    public const STATUS_FROZEN = 'frozen';
    public const STATUS_CLOSED = 'closed';

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isFrozen(): bool
    {
        return $this->status === self::STATUS_FROZEN;
    }

    public function isClosed(): bool
    {
        return $this->status === self::STATUS_CLOSED;
    }

    protected static function newFactory()
    {
        return SubledgerAccountFactory::new();
    }
}