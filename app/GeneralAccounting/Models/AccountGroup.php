<?php

namespace App\GeneralAccounting\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountGroup extends Model
{
    use HasFactory;

    protected $table = 'account_groups';

    protected $fillable = [
        'organization_id',
        'parent_id',
        'code',
        'name',
        'type',
        'normal_balance',
        'level',
        'is_system',
        'status',
    ];

    protected $casts = [
        'level' => 'integer',
        'is_system' => 'boolean',
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(LedgerAccount::class);
    }
}
