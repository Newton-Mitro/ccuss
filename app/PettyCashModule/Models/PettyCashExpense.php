<?php

namespace App\PettyCashModule\Models;

use App\PettyCashModule\Models\AdvanceExpense;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'branch_id',
        'custodian_id',
        'imprest_amount',
        'balance',
        'is_active',
    ];

    protected $casts = [
        'imprest_amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function custodian()
    {
        return $this->belongsTo(User::class, 'custodian_id');
    }

    public function advanceExpenses()
    {
        return $this->hasMany(AdvanceExpense::class);
    }

    // Future-proof (for transaction ledger)
    // public function transactions()
    // {
    //     return $this->hasMany(PettyCashTransaction::class);
    // }
}