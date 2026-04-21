<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Models\AuditLog;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'customer_no',
        'type',
        'name',
        'phone',
        'email',

        'identification_type',
        'identification_number',

        'dob',
        'gender',
        'marital_status',
        'blood_group',
        'nationality',
        'occupation',
        'education',
        'religion',

        'kyc_status',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
    ];

    /* ========================
     * Core Relationships
     * ======================== */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /* ========================
     * Customer Information
     * ======================== */

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function familyRelations(): HasMany
    {
        return $this->hasMany(CustomerFamilyRelation::class);
    }

    public function relatedToMe(): HasMany
    {
        return $this->hasMany(CustomerFamilyRelation::class, 'relative_id');
    }

    /* ========================
     * KYC
     * ======================== */

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
            ->where('document_type', 'photo');
    }

    public function signature(): HasOne
    {
        return $this->hasOne(KycDocument::class)
            ->where('document_type', 'signature');
    }

    /* ========================
     * Introducer System
     * ======================== */

    public function introducers(): HasMany
    {
        return $this->hasMany(CustomerIntroducer::class, 'introduced_customer_id');
    }

    public function introducedCustomers(): HasMany
    {
        return $this->hasMany(CustomerIntroducer::class, 'introducer_customer_id');
    }

    /* ========================
     * Online Service
     * ======================== */

    public function onlineServiceClient(): HasOne
    {
        return $this->hasOne(User::class);
    }

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}