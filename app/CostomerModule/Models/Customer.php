<?php

namespace App\CostomerModule\Models;

use App\Audit\Traits\Auditable;
use App\SystemAdministration\Models\User;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Customer extends Model
{
    use HasFactory, Auditable;

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
        'kyc_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
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

    public function kycProfile(): HasOne
    {
        return $this->hasOne(KycProfile::class);
    }

    public function kycDocuments(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }

    public function photo(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'PHOTO');
    }

    public function signature(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'SIGNATURE');
    }

    public function introducers(): HasMany
    {
        return $this->hasMany(CustomerIntroducer::class, 'introduced_customer_id');
    }

    public function introducedCustomers(): HasMany
    {
        return $this->hasMany(CustomerIntroducer::class, 'introducer_customer_id');
    }

    public function onlineServiceClient(): HasOne
    {
        return $this->hasOne(OnlineServiceClient::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}