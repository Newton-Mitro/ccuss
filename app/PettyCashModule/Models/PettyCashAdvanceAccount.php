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
        'link_account_id',
        'employee_id',
        'ledger_account_id',
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

    public function ledgerAccount()
    {
        return $this->belongsTo(LedgerAccount::class);
    }

    public function linkAccount()
    {
        return $this->belongsTo(SubledgerAccount::class, 'link_account_id');
    }
}