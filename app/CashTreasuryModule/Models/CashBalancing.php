<?php

namespace App\CashTreasuryModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashBalancing extends Model
{
    protected $fillable = [
        'cash_drawer_id',
        'expected_balance',
        'actual_balance',
        'difference',
        'verified_by',
        'balanced_at',
        'remarks'
    ];

    public function cashDrawer(): BelongsTo
    {
        return $this->belongsTo(CashDrawer::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}