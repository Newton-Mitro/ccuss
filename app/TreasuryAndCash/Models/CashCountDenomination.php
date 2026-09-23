<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\TreasuryAndCash\Models\CashCount;
use App\TreasuryAndCash\Models\CashDenomination;

class CashCountDenomination extends Model
{
    use HasFactory;

    protected $fillable = ['cash_count_id', 'cash_denomination_id', 'quantity', 'amount'];

    protected $casts = ['quantity' => 'integer', 'amount' => 'decimal:4'];

    public function cashCount(): BelongsTo
    {
        return $this->belongsTo(CashCount::class);
    }
    public function denomination(): BelongsTo
    {
        return $this->belongsTo(CashDenomination::class, 'cash_denomination_id');
    }
}