<?php

namespace App\PettyCashModule\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use App\SubledgerModule\Models\SubledgerAccount;
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
        'subledger_account_id',
        'name',
        'upper_limit',
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

    // ✅ NEW: Link Account (Main Account reference)
    public function subledgerAccount()
    {
        return $this->belongsTo(SubledgerAccount::class, 'subledger_account_id');
    }

    public function advanceAccounts()
    {
        return $this->hasMany(PettyCashAdvanceAccount::class);
    }
}