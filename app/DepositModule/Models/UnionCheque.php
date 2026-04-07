<?php

namespace App\Models;

use App\DepositModule\Models\UnionChequeBook;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnionCheque extends Model
{
    use HasFactory;

    protected $fillable = [
        'union_cheque_book_id',
        'cheque_number',
        'cheque_date',
        'amount',
        'payee_name',
        'remarks',
        'status',
        'stop_payment',
    ];

    protected $casts = [
        'cheque_date' => 'date',
        'amount' => 'decimal:2',
        'stop_payment' => 'boolean',
    ];

    const STATUS_ISSUED = 'issued';
    const STATUS_PRESENTED = 'presented';
    const STATUS_CLEARED = 'cleared';
    const STATUS_BOUNCED = 'bounced';
    const STATUS_CANCELLED = 'cancelled';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function chequeBook()
    {
        return $this->belongsTo(UnionChequeBook::class, 'union_cheque_book_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (Optional but powerful)
    |--------------------------------------------------------------------------
    */

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopeCleared($query)
    {
        return $query->where('status', 'cleared');
    }

    public function scopeBounced($query)
    {
        return $query->where('status', 'bounced');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPayable()
    {
        return $this->status === 'issued' && !$this->stop_payment;
    }

    public function generateCheques()
    {
        for ($i = $this->start_number; $i <= $this->end_number; $i++) {
            $this->cheques()->create([
                'cheque_number' => $i,
                'amount' => 0,
                'status' => UnionCheque::STATUS_ISSUED,
            ]);
        }
    }
}