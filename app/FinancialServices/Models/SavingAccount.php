<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'minimum_balance',
        'settings',
    ];

    protected $casts = [
        'minimum_balance' => 'decimal:4',
        'settings' => 'array',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }
}
