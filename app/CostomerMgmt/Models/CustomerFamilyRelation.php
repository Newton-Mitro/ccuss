<?php

namespace App\CostomerMgmt\Models;

use Database\Factories\CustomerFamilyRelationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerFamilyRelation extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'relative_id',
        'name',
        'phone',
        'email',
        'dob',
        'gender',
        'religion',
        'identification_type',
        'identification_number',
        'photo',
        'relation_type',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function relative(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'relative_id');
    }

    protected static function newFactory()
    {
        return CustomerFamilyRelationFactory::new();
    }
}