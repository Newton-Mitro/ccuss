<?php

namespace App\CostomerManagement\Customer\Models;

use App\CostomerManagement\Address\Models\Address;
use App\CostomerManagement\FamilyRelation\Models\FamilyRelation;
use App\Media\Models\Media;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_no',
        'type',
        'name',
        'phone',
        'email',
        'kyc_level',
        'status',
        'dob',
        'gender',
        'religion',
        'identification_type',
        'identification_number',
        'photo_id',
        'registration_no',
    ];

    // Casts
    protected $casts = [
        'dob' => 'date',
    ];

    public function photo()
    {
        return $this->belongsTo(Media::class, 'photo_id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function familyRelations()
    {
        return $this->hasMany(FamilyRelation::class);
    }

    public function introducers()
    {
        return $this->hasMany(Introducer::class, 'introduced_customer_id');
    }

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}
