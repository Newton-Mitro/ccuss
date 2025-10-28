<?php

namespace App\CostomerManagement\Customer\Models;

use App\Media\Models\Media;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    public function photo()
    {
        return $this->belongsTo(Media::class, 'photo');
    }

    protected static function newFactory()
    {
        return CustomerFactory::new();
    }
}
