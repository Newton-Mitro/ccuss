<?php

namespace App\VoucherEntryModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
    ];

    public function entries(): HasMany
    {
        return $this->hasMany(VoucherEntry::class);
    }
}