<?php

namespace App\BankAndChequeModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bank extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'short_name',
        'swift_code',
        'routing_number',
        'status',
    ];

    public function branches()
    {
        return $this->hasMany(BankBranch::class);
    }

    public function accounts()
    {
        return $this->hasMany(BankAccount::class);
    }
}