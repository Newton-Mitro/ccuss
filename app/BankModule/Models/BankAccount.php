<?php

namespace App\BankAndChequeModule\Models;

use App\ChequeManagement\Models\BankCheque;
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
        'status',
        'created_by',
        'approved_by',
    ];

    protected $appends = [
        'display_name',
        'account_type_label',
        'account_type_class',
    ];

    public function getDisplayNameAttribute()
    {
        return "{$this->bank?->name} - {$this->account_number}";
    }

    public function getAccountTypeLabelAttribute()
    {
        return 'Bank Account';
    }

    public function getAccountTypeClassAttribute()
    {
        return self::class;
    }

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
}