<?php

namespace App\CostomerManagement\FamilyRelation\Models;

use App\CostomerManagement\Customer\Models\Customer;
use Database\Factories\FamilyRelationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyRelation extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'relative_id',
        'relation_type',
        'reverse_relation_type',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function relative()
    {
        return $this->belongsTo(Customer::class, 'relative_id');
    }

    public function getRelationTypeLabelAttribute(): string
    {
        return str_replace('_', ' ', ucfirst(strtolower($this->relation_type)));
    }

    /**
     * Accessor to get a nicely formatted reverse relation type.
     */
    public function getReverseRelationTypeLabelAttribute(): string
    {
        return str_replace('_', ' ', ucfirst(strtolower($this->reverse_relation_type)));
    }

    protected static function newFactory()
    {
        return FamilyRelationFactory::new();
    }
}
