<?php

namespace App\TreasuryAndCash\Models;

use App\TreasuryAndCash\Models\Cheque;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChequeBook extends Model
{
    use HasFactory;

    protected $fillable = [
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

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function cheques(): HasMany
    {
        return $this->hasMany(Cheque::class);
    }
}
