<?php

namespace App\FinanceAndAccounting\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\VoucherLineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VoucherLine extends Model
{
    use HasFactory, Auditable;

    /*
    |--------------------------------------------------------------------------
    | Constants
    |--------------------------------------------------------------------------
    */

    public const COMPONENTS = [
        'PRINCIPAL',
        'INTEREST',
        'PENALTY',
        'DEPOSIT',
        'WITHDRAWAL',
        'CASH_IN',
        'CASH_OUT',
    ];

    public const DR_CR = ['DR', 'CR'];

    /*
    |--------------------------------------------------------------------------
    | Mass Assignment
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'voucher_id',
        'ledger_account_id',

        // Polymorphic subledger
        'subledger_id',
        'subledger_type',

        // Instrument details
        'instrument_type_id',
        'instrument_id',

        'component',
        'particulars',

        'debit',
        'credit',
        'dr_cr',
    ];

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

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
     * Example:
     * - DepositAccount
     * - LoanAccount
     * - MemberAccount
     */
    public function subledger(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Instrument Type
     * Example: Cheque, Card, Mobile Txn
     */
    public function instrumentType(): BelongsTo
    {
        return $this->belongsTo(InstrumentType::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isDebit(): bool
    {
        return $this->dr_cr === 'DR';
    }

    public function isCredit(): bool
    {
        return $this->dr_cr === 'CR';
    }

    public function amount(): float
    {
        return $this->isDebit()
            ? (float) $this->debit
            : (float) $this->credit;
    }

    /*
    |--------------------------------------------------------------------------
    | Model Events
    |--------------------------------------------------------------------------
    */

    protected static function booted()
    {
        static::saving(function ($line) {

            // Auto sync debit/credit with DR_CR
            if ($line->dr_cr === 'DR') {
                $line->credit = 0;
            }

            if ($line->dr_cr === 'CR') {
                $line->debit = 0;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Factory
    |--------------------------------------------------------------------------
    */

    protected static function newFactory(): VoucherLineFactory
    {
        return VoucherLineFactory::new();
    }
}