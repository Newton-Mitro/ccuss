<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vault extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_location_id',
        'code',
        'name',
        'status',
        'maximum_balance',
    ];

    protected $casts = [
        'maximum_balance' => 'decimal:4',
    ];

    public function cashLocation(): BelongsTo
    {
        return $this->belongsTo(CashLocation::class);
    }
}
