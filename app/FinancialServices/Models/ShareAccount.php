<?php

namespace App\FinancialServices\Models;

use App\CustomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShareAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'deposit_account_id',
        'customer_id',
        'member_since',
        'membership_no',
        'membership_status',
    ];

    protected $casts = [
        'member_since' => 'date',
    ];

    public function depositAccount(): BelongsTo
    {
        return $this->belongsTo(DepositAccount::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function dividendAllocations(): HasMany
    {
        return $this->hasMany(ShareDividendAllocation::class);
    }
}
