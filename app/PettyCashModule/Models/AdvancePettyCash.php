<?php

namespace App\PettyCashModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvancePettyCash extends Model
{
    use HasFactory;

    protected $fillable = [
        'petty_cash_account_id',
        'employee_id',
        'branch_id',
        'name',
        'code',
        'balance',
        'is_active',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function pettyCashAccount()
    {
        return $this->belongsTo(PettyCashAccount::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    // Future-proof ledger tracking
    // public function transactions()
    // {
    //     return $this->hasMany(PettyCashTransaction::class);
    // }
}