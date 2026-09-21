<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChequeTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'cheque_id',
        'branch_day_id',
        'type',
        'amount',
        'transaction_date',
        'reference',
        'description',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'transaction_date' => 'datetime',
    ];

    public function cheque(): BelongsTo
    {
        return $this->belongsTo(Cheque::class);
    }
}
