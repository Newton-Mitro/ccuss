<?php

namespace App\ChequeManagement\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankChequeBook extends Model
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
        'start_number' => 'integer',
        'end_number' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // public function depositAccount()
    // {
    //     return $this->belongsTo(DepositAccount::class);
    // }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function cheques()
    {
        return $this->hasMany(BankCheque::class, 'bank_cheque_book_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function totalLeaves(): int
    {
        if ($this->start_number && $this->end_number) {
            return max(0, ($this->end_number - $this->start_number) + 1);
        }

        return 0;
    }

    public function usedLeaves(): int
    {
        return $this->cheques()->count();
    }

    public function remainingLeaves(): int
    {
        return $this->totalLeaves() - $this->usedLeaves();
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (Optional but Powerful)
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->whereColumn('start_number', '<=', 'end_number');
    }
}