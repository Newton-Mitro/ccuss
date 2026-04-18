<?php

namespace App\PettyCashModule\Models;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PettyCashAdvanceAccount extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'petty_cash_account_id',
        'employee_id',
        'ledger_account_id',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
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

    public function ledgerAccount()
    {
        return $this->belongsTo(LedgerAccount::class);
    }
}