<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = ['name', 'slug', 'description'];

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'permission_role', // <--- pivot table name, must match your migration
            'role_id',         // <--- foreign key on pivot table pointing to this model
            'permission_id'    // <--- foreign key on pivot table pointing to related model
        );
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_role');
    }
}

