<?php

namespace App\PettyCashModule\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'petty_cash_account_id',
        'reference_type',
        'reference_id',
        'debit',
        'credit',
        'balance',
        'transaction_date',
    ];

    public function account()
    {
        return $this->belongsTo(PettyCashAccount::class, 'petty_cash_account_id');
    }

    public function reference()
    {
        return $this->morphTo();
    }
}