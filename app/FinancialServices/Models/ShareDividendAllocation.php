<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShareDividendAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'share_dividend_declaration_id',
        'share_account_id',
        'basis_amount',
        'dividend_rate',
        'dividend_amount',
        'status',
        'financial_transaction_id',
    ];

    protected $casts = [
        'basis_amount' => 'decimal:4',
        'dividend_rate' => 'decimal:6',
        'dividend_amount' => 'decimal:4',
    ];

    public function declaration(): BelongsTo
    {
        return $this->belongsTo(ShareDividendDeclaration::class, 'share_dividend_declaration_id');
    }

    public function shareAccount(): BelongsTo
    {
        return $this->belongsTo(ShareAccount::class);
    }
}
