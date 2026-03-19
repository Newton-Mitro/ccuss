<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use App\CustomerModule\Models\Customer;
use Database\Factories\BranchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'address',
        'latitude',
        'longitude',
        'manager_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function manager()
    {
        return $this->belongsTo(Customer::class, 'manager_id');
    }

    protected static function newFactory()
    {
        return BranchFactory::new();
    }
}
