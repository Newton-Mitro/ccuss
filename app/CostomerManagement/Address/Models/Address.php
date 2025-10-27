<?php

namespace App\CostomerManagement\Address\Models;

use App\CostomerManagement\Customer\Models\Customer;
use Database\Factories\AddressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'line1',
        'line2',
        'division',
        'district',
        'upazila',
        'union_ward',
        'village_locality',
        'postal_code',
        'country_code',
        'type',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }


    protected static function newFactory()
    {
        return AddressFactory::new();
    }

}
