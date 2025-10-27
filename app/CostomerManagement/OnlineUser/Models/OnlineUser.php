<?php

namespace App\CostomerManagement\OnlineUser\Models;

use Database\Factories\OnlineUserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnlineUser extends Model
{
    /** @use HasFactory<\Database\Factories\OnlineUserFactory> */
    use HasFactory;

    protected static function newFactory()
    {
        return OnlineUserFactory::new();
    }
}
