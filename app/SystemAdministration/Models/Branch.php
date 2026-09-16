<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use App\CustomerModule\Models\Customer;
use Database\Factories\BranchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, Auditable, SoftDeletes;

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

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'branch_user')
            ->withTimestamps();
    }

    protected static function newFactory()
    {
        return BranchFactory::new();
    }
}
