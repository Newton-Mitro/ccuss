<?php

namespace App\BankCashModule\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankBranch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bank_id',
        'name',
        'routing_number',
        'address',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function accounts()
    {
        return $this->hasMany(BankAccount::class);
    }
}