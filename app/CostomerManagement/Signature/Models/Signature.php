<?php

namespace App\CostomerManagement\Signature\Models;

use Database\Factories\SignatureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{
    /** @use HasFactory<\Database\Factories\SignatureFactory> */
    use HasFactory;

    protected static function newFactory()
    {
        return SignatureFactory::new();
    }
}
