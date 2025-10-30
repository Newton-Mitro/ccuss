<?php

namespace App\CostomerManagement\Customer\Models;

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

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}
