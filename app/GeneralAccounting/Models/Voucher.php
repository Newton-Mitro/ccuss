<?php

namespace App\GeneralAccounting\Models;

use App\GeneralAccounting\Models\VoucherEntry;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    protected $fillable = [
        'organization_id',
        'branch_id',
        'fiscal_year_id',
        'fiscal_period_id',
        'voucher_no',
        'voucher_type',
        'voucher_date',
        'description',
        'status',
        'created_by',
        'posted_by',
        'posted_at',
    ];

    protected $casts = [
        'voucher_date' => 'date',
        'posted_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function fiscalPeriod(): BelongsTo
    {
        return $this->belongsTo(FiscalPeriod::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(VoucherEntry::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
