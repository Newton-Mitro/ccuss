<?php

namespace App\CostomerMgmt\Models;

use App\UserRolePermissions\Models\User;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_no',
        'type',
        'name',
        'phone',
        'email',
        'dob',
        'gender',
        'religion',
        'identification_type',
        'identification_number',
        'kyc_level',
        'kyc_status',
        'kyc_verified_by',
        'kyc_verified_at',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
        'kyc_verified_at' => 'datetime',
    ];

    /* ========================
     * Relationships
     * ======================== */

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function familyRelations(): HasMany
    {
        return $this->hasMany(CustomerFamilyRelation::class);
    }

    public function photo(): HasOne
    {
        return $this->hasOne(CustomerPhoto::class);
    }

    public function signature(): HasOne
    {
        return $this->hasOne(CustomerSignature::class);
    }

    public function introducers(): HasMany
    {
        return $this->hasMany(CustomerIntroducer::class, 'introduced_customer_id');
    }

    public function onlineUser(): HasOne
    {
        return $this->hasOne(OnlineServiceClient::class);
    }

    public function kycVerifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kyc_verified_by');
    }

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}
