<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permission extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = ['name', 'slug', 'description'];

    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'permission_role', // pivot table
            'permission_id',
            'role_id'
        );
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permission');
    }
}
