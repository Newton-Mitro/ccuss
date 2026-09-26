<?php

namespace App\TreasuryAndCash\Models;

use App\TreasuryAndCash\Models\Cheque;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;

class ChequeBook extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::created(function (self $book): void {
            if ($book->cheques()->exists() || !isset($book->start_number, $book->end_number)) {
                return;
            }

            $start = (int) $book->start_number;
            $end = (int) $book->end_number;
            $hasFinancialAccountColumn = Schema::hasColumn('cheques', 'financial_account_id');

            for ($number = $start; $number <= $end; $number++) {
                $chequeData = [
                    'cheque_no' => ($book->prefix ?? '') . $number,
                    'status' => 'UNUSED',
                ];

                if ($hasFinancialAccountColumn) {
                    $chequeData['financial_account_id'] = $book->financial_account_id;
                }

                $book->cheques()->create($chequeData);
            }

            $book->refresh();
            $book->update([
                'current_number' => $start,
                'leaf_count' => $end - $start + 1,
            ]);
        });
    }

    protected $fillable = [
        'financial_account_id',
        'bank_account_id',
        'book_no',
        'prefix',
        'start_number',
        'end_number',
        'current_number',
        'leaf_count',
        'issued_date',
        'status',
    ];

    public function canIssue(): bool
    {
        return in_array($this->status, ['AVAILABLE', 'IN_USE'], true)
            && $this->cheques()->where('status', 'UNUSED')->exists();
    }

    protected $casts = [
        'start_number' => 'integer',
        'end_number' => 'integer',
        'current_number' => 'integer',
        'leaf_count' => 'integer',
        'issued_date' => 'date',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(\App\FinancialServices\Models\FinancialAccount::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function cheques(): HasMany
    {
        return $this->hasMany(Cheque::class);
    }
}
