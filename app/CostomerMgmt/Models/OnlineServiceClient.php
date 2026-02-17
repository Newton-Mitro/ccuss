<?php

namespace App\CostomerMgmt\Models;

use Database\Factories\OnlineServiceClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnlineServiceClient extends Model
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
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    protected static function newFactory()
    {
        return OnlineServiceClientFactory::new();
    }
}