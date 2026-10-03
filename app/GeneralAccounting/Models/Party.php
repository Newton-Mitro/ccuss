<?php

namespace App\GeneralAccounting\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Party extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'party_type',
        'phone',
        'email',
        'address',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function voucherEntries(): HasMany
    {
        return $this->hasMany(VoucherEntry::class);
    }
}