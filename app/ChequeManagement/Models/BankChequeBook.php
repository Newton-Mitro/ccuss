<?php

namespace App\ChequeManagement\Models;

use App\ChequeManagement\Models\BankCheque;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankChequeBook extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
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
    | Core Business Logic
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
                BankCheque::STATUS_ISSUED,
                BankCheque::STATUS_PRESENTED,
                BankCheque::STATUS_CLEARED,
                BankCheque::STATUS_BOUNCED,
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

    public function isChequeNumberValid(int $number): bool
    {
        return $number >= $this->start_number
            && $number <= $this->end_number;
    }

    public function unusedCheques()
    {
        return $this->hasMany(BankCheque::class, 'bank_cheque_book_id')
            ->where('status', BankCheque::STATUS_ISSUED);
    }
}