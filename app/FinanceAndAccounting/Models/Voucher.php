<?php

namespace App\FinanceAndAccounting\Models;

use App\Audit\Traits\Auditable;
use App\Branch\Models\Branch;
use App\SystemAdministration\Models\User;
use Database\Factories\VoucherFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory, Auditable;

    /*
    |--------------------------------------------------------------------------
    | Constants
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_POSTED = 'POSTED';
    public const STATUS_CANCELLED = 'CANCELLED';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_POSTED,
        self::STATUS_CANCELLED,
    ];

    public const TYPES = [
        'OPENING_BALANCE',       // Initial balance of accounts
        'CLOSING_BALANCE',       // Closing balance (optional)
        'CREDIT_OR_RECEIPT',     // Cash/bank inflow
        'DEBIT_OR_PAYMENT',      // Cash/bank outflow
        'JOURNAL_OR_NON_CASH',   // Non-cash adjustments / transfers
        'PURCHASE',              // Purchase invoice
        'SALE',                  // Sales invoice
        'DEBIT_NOTE',            // Adjustment reducing payable
        'CREDIT_NOTE',           // Adjustment reducing receivable
        'CONTRA',                // Bank/Cash transfer within accounts
    ];

    /*
    |--------------------------------------------------------------------------
    | Mass Assignment
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'fiscal_year_id',
        'accounting_period_id',
        'branch_id',
        'voucher_date',
        'voucher_type',
        'voucher_no',
        'reference',
        'total_amount',
        'created_by',
        'posted_by',
        'posted_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'narration',
        'status',
    ];

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'voucher_date' => 'datetime',
        'posted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

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
        return $this->belongsTo(AccountingPeriod::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(VoucherLine::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Status Helpers
    |--------------------------------------------------------------------------
    */

    public function canEdit(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function canPost(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function canApprove(): bool
    {
        return $this->status === self::STATUS_POSTED;
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory()
    {
        return VoucherFactory::new();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Automatically calculate total debit / credit from lines
     */
    public function calculateTotalAmount(): void
    {
        $this->total_amount = $this->lines()->sum('debit');
        $this->save();
    }
}