<?php

namespace App\PettyCashModule\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PettyCashAdvanceAccount extends Model
{
    use SoftDeletes, Auditable, SoftDeletes;

    protected $fillable = [
        'petty_cash_account_id',
        'subledger_account_id',
        'employee_id',
        'status',
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

    public function subledgerAccount()
    {
        return $this->belongsTo(SubledgerAccount::class, 'subledger_account_id');
    }
}