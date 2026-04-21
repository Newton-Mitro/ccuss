<?php

namespace App\BranchTreasuryModule\Models;

use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teller extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'user_id',
        'branch_id',
        'subledger_account_id',
        'name',
        'max_cash_limit',
        'max_transaction_limit',
        'is_active'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function subledgerAccount(): BelongsTo
    {
        return $this->belongsTo(SubledgerAccount::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TellerSession::class);
    }
}