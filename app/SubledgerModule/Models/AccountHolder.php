<?php

namespace App\SubledgerModule\Models;

use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountHolder extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'subledger_account_id',
        'customer_id',
        'holder_type',
        'ownership_percent',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'ownership_percent' => 'decimal:2',
    ];

    public function subledgerAccount(): BelongsTo
    {
        return $this->belongsTo(SubledgerAccount::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
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