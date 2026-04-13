<?php

namespace App\SubledgerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Account extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'accountable_type',
        'accountable_id',
        'account_number',
        'name',
        'type',
        'balance',
        'status',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function accountable(): MorphTo
    {
        return $this->morphTo();
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

    protected static function newFactory()
    {
        return AccountFactory::new();
    }
}