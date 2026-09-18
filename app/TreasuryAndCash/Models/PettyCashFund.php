<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCashFund extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_location_id',
        'custodian_id',
        'code',
        'name',
        'fund_limit',
        'current_balance',
        'method',
        'status',
    ];

    protected $casts = [
        'fund_limit' => 'decimal:4',
        'current_balance' => 'decimal:4',
    ];

    public function cashLocation(): BelongsTo
    {
        return $this->belongsTo(CashLocation::class);
    }

    public function custodian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'custodian_id');
    }
}
