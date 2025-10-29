<?php

namespace App\Branch\Models;

use App\CostomerManagement\Customer\Models\Customer;
use Database\Factories\BranchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    public function manager()
    {
        return $this->belongsTo(Customer::class, 'manager_id');
    }

    protected static function newFactory()
    {
        return BranchFactory::new();
    }
}
