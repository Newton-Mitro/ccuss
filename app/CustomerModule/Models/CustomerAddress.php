<?php

namespace App\CustomerModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\CustomerAddressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerAddress extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'line1',
        'line2',
        'division',
        'district',
        'upazila',
        'union_ward',
        'postal_code',
        'country',
        'type',
    ];

    /* ========================
     * Core Relationships
     * ======================== */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }


    protected static function newFactory()
    {
        return CustomerAddressFactory::new();
    }
}