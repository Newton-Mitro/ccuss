<?php

namespace App\GeneralAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use App\SystemAdministration\Models\Organization;
use Database\Factories\LedgerAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LedgerAccount extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'type',
        'description',
        'is_control_account',
        'is_group',
        'is_active',
        'subledger_type',
        'subledger_sub_type',
        'parent_id',
    ];

    protected $casts = [
        'is_control_account' => 'boolean',
        'is_group' => 'boolean',
        'is_active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(LedgerAccount::class, 'parent_id');
    }

    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors (Derived Logic)
    |--------------------------------------------------------------------------
    */

    // A leaf node = no children
    public function getIsLeafAttribute(): bool
    {
        return !$this->is_group;
    }

    // Requires subledger if type exists
    public function getRequiresSubledgerAttribute(): bool
    {
        return !is_null($this->subledger_type);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (Pro-level querying 🚀)
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeGroups($query)
    {
        return $query->where('is_group', true);
    }

    public function scopeLeaf($query)
    {
        return $query->where('is_group', false);
    }

    protected static function newFactory(): LedgerAccountFactory
    {
        return LedgerAccountFactory::new();
    }
}