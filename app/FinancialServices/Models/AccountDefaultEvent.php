<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\AccountFine;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountDefaultEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'account_default_rule_id',
        'due_date',
        'assessed_at',
        'days_overdue',
        'status',
        'resolved_at',
        'resolution_note',
    ];

    protected $casts = [
        'due_date' => 'date',
        'assessed_at' => 'date',
        'resolved_at' => 'datetime',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(AccountDefaultRule::class, 'account_default_rule_id');
    }

    public function fines(): HasMany
    {
        return $this->hasMany(AccountFine::class);
    }
}
