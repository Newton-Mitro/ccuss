<?php

namespace App\CostomerMgmt\Models;

use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerIntroducer extends Model
{
    use HasFactory;

    protected $fillable = [
        'introduced_customer_id',
        'introducer_customer_id',
        'introducer_account_id',
        'relationship_type',
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

    public function introducedCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'introduced_customer_id');
    }

    public function introducerCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'introducer_customer_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
