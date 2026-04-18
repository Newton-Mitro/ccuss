<?php

namespace App\PettyCashModule\Models;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PettyCashAccount extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'name',
        'upper_limit',
        'ledger_account_id',
        'status',
    ];

    protected $casts = [
        'upper_limit' => 'decimal:2',
        'status' => 'string',
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

    public function ledgerAccount()
    {
        return $this->belongsTo(LedgerAccount::class);
    }

    public function advanceAccounts()
    {
        return $this->hasMany(PettyCashAdvanceAccount::class);
    }
}