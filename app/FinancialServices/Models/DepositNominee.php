<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositNominee extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'name',
        'relationship',
        'phone',
        'identification_type',
        'identification_number',
        'share_percent',
        'is_primary',
    ];

    protected $casts = [
        'share_percent' => 'decimal:4',
        'is_primary' => 'boolean',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }
}