<?php

namespace App\ChequeManagement\Models;

use App\ChequeManagement\Models\Cheque;
use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChequeBook extends Model
{
    use HasFactory, Auditable;

    protected $table = 'cheque_books';

    protected $fillable = [
        'account_id',
        'book_no',
        'start_number',
        'end_number',
        'issued_at',
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

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function cheques()
    {
        return $this->hasMany(Cheque::class, 'cheque_book_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic
    |--------------------------------------------------------------------------
    */

    public function totalLeaves(): int
    {
        if (!$this->isValidRange()) {
            return 0;
        }

        return ($this->end_number - $this->start_number) + 1;
    }

    public function usedLeaves(): int
    {
        return $this->cheques()
            ->whereIn('status', [
                Cheque::STATUS_ISSUED,
                Cheque::STATUS_PRESENTED,
                Cheque::STATUS_CLEARED,
                Cheque::STATUS_BOUNCED,
            ])
            ->count();
    }

    public function remainingLeaves(): int
    {
        return max(0, $this->totalLeaves() - $this->usedLeaves());
    }

    public function isExhausted(): bool
    {
        return $this->remainingLeaves() === 0;
    }

    public function isValidRange(): bool
    {
        return $this->start_number !== null
            && $this->end_number !== null
            && $this->start_number <= $this->end_number;
    }

    public function isChequeNumberValid(int $number): bool
    {
        return $number >= $this->start_number
            && $number <= $this->end_number;
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeValid($query)
    {
        return $query->whereColumn('start_number', '<=', 'end_number');
    }

    public function scopeWithAvailableLeaves($query)
    {
        return $query->whereRaw('(end_number - start_number + 1) > 0');
    }

    /*
    |--------------------------------------------------------------------------
    | Convenience Collections
    |--------------------------------------------------------------------------
    */

    public function issuedCheques()
    {
        return $this->hasMany(Cheque::class, 'cheque_book_id')
            ->where('status', Cheque::STATUS_ISSUED);
    }

    public function clearedCheques()
    {
        return $this->hasMany(Cheque::class, 'cheque_book_id')
            ->where('status', Cheque::STATUS_CLEARED);
    }

    public function bouncedCheques()
    {
        return $this->hasMany(Cheque::class, 'cheque_book_id')
            ->where('status', Cheque::STATUS_BOUNCED);
    }
}