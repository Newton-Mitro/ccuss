<?php

namespace App\CostomerManagement\OnlineClient\Models;

use App\CostomerManagement\Customer\Models\Customer;
use Database\Factories\OnlineClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnlineClient extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'username',
        'email',
        'phone',
        'password',
        'last_login_at',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    protected static function newFactory()
    {
        return OnlineClientFactory::new();
    }
}
