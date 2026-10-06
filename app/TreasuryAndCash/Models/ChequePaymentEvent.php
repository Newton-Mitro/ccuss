<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\ChequePayment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChequePaymentEvent extends Model
{
    protected $fillable = [
        'cheque_payment_id',
        'performed_by',
        'action',
        'metadata',
        'reason',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function chequePayment(): BelongsTo
    {
        return $this->belongsTo(ChequePayment::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}