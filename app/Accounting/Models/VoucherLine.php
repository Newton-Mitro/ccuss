<?php

namespace App\Accounting\Models;

use Database\Factories\VoucherLineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VoucherLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'ledger_account_id',

        // Polymorphic relations
        'subledger_id',
        'subledger_type',
        'reference_id',
        'reference_type',

        // Instrument details
        'instrument_type',
        'instrument_no',

        'particulars',
        'debit',
        'credit',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /* =======================
     |  Relationships
     ======================= */

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function ledgerAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class);
    }

    /**
     * Polymorphic subledger
     * Example: DepositAccount, LoanAccount, MemberAccount
     */
    public function subledger(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Optional reference
     * Example: Transaction, Cheque, Invoice, Transfer
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function newFactory()
    {
        return VoucherLineFactory::new();
    }
}