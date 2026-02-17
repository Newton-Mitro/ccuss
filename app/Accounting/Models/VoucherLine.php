<?php

namespace App\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VoucherLine extends Model
{
    protected $fillable = [
        'voucher_id',
        'account_id',
        'subledger_id',
        'subledger_type',
        'associate_ledger_id',
        'narration',
        'debit',
        'credit',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function subledger(): MorphTo
    {
        return $this->morphTo();
    }
}
