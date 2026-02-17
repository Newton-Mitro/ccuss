<?php

namespace App\Accounting\Models;

use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    protected $fillable = [
        'fiscal_year_id',
        'fiscal_period_id',
        'branch_id',
        'voucher_date',
        'voucher_type',
        'voucher_no',
        'reference',
        'approved_by',
        'approved_at',
        'created_by',
        'narration',
        'status',
    ];

    protected $casts = [
        'voucher_date' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function fiscalPeriod(): BelongsTo
    {
        return $this->belongsTo(FiscalPeriod::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(VoucherLine::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
