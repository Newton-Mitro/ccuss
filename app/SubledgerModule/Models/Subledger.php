<?php

namespace App\SubledgerModule\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subledger extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'short_name',
        'subledger_type',
        'subledger_sub_type',
        'is_active',
        'gl_account_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function glAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'gl_account_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (Clean Query Layer)
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('subledger_type', $type);
    }

    public function scopeBySubType($query, string $subType)
    {
        return $query->where('subledger_sub_type', $subType);
    }

}