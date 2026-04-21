<?php

namespace App\VoucherEntryModule\Models;

use App\BranchTreasuryModule\Models\BranchDay;
use App\BranchTreasuryModule\Models\TellerSession;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VoucherEntry extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'fiscal_year_id',
        'fiscal_period_id',
        'reference',
        'voucher_id',
        'source_type',
        'channel',
        'branch_id',
        'branch_day_id',
        'teller_session_id',
        'reversal_of',
        'is_reversed',
        'is_adjustment',
        'amount',
        'description',
        'transaction_date',
        'status',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'is_reversed' => 'boolean',
        'is_adjustment' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(VoucherEntryLine::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    public function reversal(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reversal_of');
    }

    public function reversedEntries(): HasMany
    {
        return $this->hasMany(self::class, 'reversal_of');
    }
}