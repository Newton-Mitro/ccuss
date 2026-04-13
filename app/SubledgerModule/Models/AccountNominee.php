<?php

namespace App\SubledgerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountNominee extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'account_id',
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

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\SystemAdministration\Models\User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(\App\SystemAdministration\Models\User::class, 'updated_by');
    }
}