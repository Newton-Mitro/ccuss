<?php

namespace App\GeneralAccounting\Models;

use App\GeneralAccounting\Models\Voucher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoucherEntry extends Model
{
    protected $fillable = [
        'voucher_id',
        'account_id',
        'branch_id',
        'cost_center_id',
        'party_type',
        'party_id',
        'description',
        'debit',
        'credit',
        'reference',
        'line_no',
    ];

    protected $casts = [
        'debit' => 'decimal:4',
        'credit' => 'decimal:4',
        'line_no' => 'integer',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'account_id');
    }
}
