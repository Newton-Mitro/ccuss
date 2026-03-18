<?php

namespace App\PettyCashModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashVoucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_no',
        'petty_cash_account_id',
        'voucher_date',
        'total_amount',
        'remarks',
        'created_by',
    ];

    public function account()
    {
        return $this->belongsTo(PettyCashAccount::class, 'petty_cash_account_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PettyCashVoucherItem::class);
    }

    public function transactions()
    {
        return $this->morphMany(PettyCashTransaction::class, 'reference');
    }
}