<?php

namespace App\Branch\Models;

use App\CostomerMgmt\Models\Customer;
use Database\Factories\BranchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
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
