<?php

namespace App\SubledgerModule\Models;

use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountNominee extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'subledger_account_id',
        'name',
        'relation',
        'date_of_birth',
        'allocation_percent',
        'remarks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'allocation_percent' => 'decimal:2',
    ];

    public function subledgerAccount(): BelongsTo
    {
        return $this->belongsTo(SubledgerAccount::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}