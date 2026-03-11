<?php

namespace App\PettyCashModule\Models;

use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashReplenishment extends Model
{
    use HasFactory;

    protected $fillable = [
        'replenish_no',
        'petty_cash_account_id',
        'source_account',
        'amount',
        'replenish_date',
        'remarks',
        'approved_by',
    ];

    public function account()
    {
        return $this->belongsTo(PettyCashAccount::class, 'petty_cash_account_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transactions()
    {
        return $this->morphMany(PettyCashTransaction::class, 'reference');
    }
}