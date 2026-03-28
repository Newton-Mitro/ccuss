<?php

namespace App\BankCashModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankCheque extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bank_account_id',
        'cheque_no',
        'type',
        'amount',
        'payee',
        'cheque_date',
        'status',
        'remarks',
        'created_by',
        'approved_by',
    ];

    public function account()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function vouchers()
    {
        return $this->morphMany(BankTransaction::class, 'reference');
    }
}