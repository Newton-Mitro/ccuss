<?php

namespace App\BankAndChequeModule\Models;

use App\BankCashModule\Models\Bank;
use App\BankCashModule\Models\BankBranch;
use App\BankCashModule\Models\BankCheque;
use App\BankCashModule\Models\BankReconciliation;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bank_id',
        'bank_branch_id',
        'account_name',
        'account_number',
        'iban',
        'opening_balance',
        'currency',
        'status',
        'created_by',
        'approved_by',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function branch()
    {
        return $this->belongsTo(BankBranch::class, 'bank_branch_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function cheques()
    {
        return $this->hasMany(BankCheque::class);
    }

    public function reconciliations()
    {
        return $this->hasMany(BankReconciliation::class);
    }
}