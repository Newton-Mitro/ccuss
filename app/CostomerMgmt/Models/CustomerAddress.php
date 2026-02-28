<?php

namespace App\CostomerMgmt\Models;

use App\Audit\Traits\Auditable;
use App\UserRolePermissions\Models\User;
use Database\Factories\CustomerAddressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerAddress extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'customer_id',
        'line1',
        'line2',
        'division',
        'district',
        'upazila',
        'union_ward',
        'postal_code',
        'country',
        'type',
        'verification_status',
        'verified_by',
        'verified_at',
        'remarks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    protected static function newFactory()
    {
        return CustomerAddressFactory::new();
    }
}