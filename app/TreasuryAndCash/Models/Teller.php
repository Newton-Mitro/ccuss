<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Teller extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_location_id',
        'user_id',
        'code',
        'name',
        'status',
        'maximum_cash',
    ];

    protected $casts = [
        'maximum_cash' => 'decimal:4',
    ];

    public function cashLocation(): BelongsTo
    {
        return $this->belongsTo(CashLocation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
