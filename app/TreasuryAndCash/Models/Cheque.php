<?php

namespace App\TreasuryAndCash\Models;

use App\TreasuryAndCash\Models\ChequeBook;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cheque extends Model
{
    use HasFactory;

    protected $fillable = [
        'cheque_book_id',
        'cheque_no',
        'status',
        'issue_date',
        'cheque_date',
        'amount',
        'payee',
        'memo',
        'presented_date',
        'cleared_date',
        'note',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'cheque_date' => 'date',
        'amount' => 'decimal:4',
        'presented_date' => 'date',
        'cleared_date' => 'date',
    ];

    public function chequeBook(): BelongsTo
    {
        return $this->belongsTo(ChequeBook::class);
    }
}
