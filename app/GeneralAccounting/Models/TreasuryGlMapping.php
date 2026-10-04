<?php

namespace App\GeneralAccounting\Models;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreasuryGlMapping extends Model
{
    protected $table = 'gl_account_mappings';

    protected $fillable = [
        'organization_id',
        'source_type',
        'source_code',
        'transaction_type',
        'debit_account_id',
        'credit_account_id',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function debitAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'debit_account_id');
    }

    public function creditAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'credit_account_id');
    }
}