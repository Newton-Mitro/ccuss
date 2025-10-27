<?php

namespace App\CostomerManagement\Customer\Models;

use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\Customer\CustomerFactory> */
    use HasFactory;

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}
