<?php

namespace App\Accounting\GlAccount\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'category',
        'parent_id',

    ];

    // 🔗 Parent relation
    public function parent()
    {
        return $this->belongsTo(GlAccount::class, 'parent_id');
    }

    // 🌿 Children relation
    public function children()
    {
        return $this->hasMany(GlAccount::class, 'parent_id');
    }

    // 🧠 Recursive relationship (optional for full hierarchy)
    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }
}