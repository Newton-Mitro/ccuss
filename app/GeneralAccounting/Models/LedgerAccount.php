<?php

namespace App\GeneralAccounting\Models;

use App\GeneralAccounting\Models\AccountGroup;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerAccount extends Model
{
    protected $table = 'accounts';

    protected $fillable = [
        'organization_id',
        'account_group_id',
        'parent_id',
        'code',
        'name',
        'type',
        'normal_balance',
        'level',
        'is_control_account',
        'is_reconcilable',
        'is_system',
        'status',
    ];

    protected $casts = [
        'level' => 'integer',
        'is_control_account' => 'boolean',
        'is_reconcilable' => 'boolean',
        'is_system' => 'boolean',
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(AccountGroup::class, 'account_group_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
