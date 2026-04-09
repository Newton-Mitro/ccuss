<?php

namespace App\PettyCashModule\Models;

use App\PettyCashModule\Models\PettyCashAccount;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashAdvance extends Model
{
    use HasFactory;

    protected $fillable = [
        'petty_cash_account_id',
        'employee_id',
        'amount',
        'advance_date',
        'purpose',
        'status',
        'approved_by',
        'settled_at',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'advance_date' => 'date',
        'settled_at' => 'datetime',
        'status' => 'string', // enum handled as string
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

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}