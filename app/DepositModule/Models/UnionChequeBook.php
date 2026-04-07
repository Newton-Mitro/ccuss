<?php

namespace App\DepositModule\Models;

use App\Models\UnionCheque;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnionChequeBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'deposit_account_id',
        'book_no',
        'start_number',
        'end_number',
        'issued_at',
        'issued_by',
    ];

    protected $casts = [
        'issued_at' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function depositAccount()
    {
        return $this->belongsTo(DepositAccount::class);
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function cheques()
    {
        return $this->hasMany(UnionCheque::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function totalLeaves()
    {
        return ($this->end_number - $this->start_number) + 1;
    }
}