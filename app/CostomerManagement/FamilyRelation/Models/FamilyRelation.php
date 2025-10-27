<?php

namespace App\CostomerManagement\FamilyRelation\Models;

use Database\Factories\FamilyRelationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyRelation extends Model
{
    /** @use HasFactory<\Database\Factories\FamilyRelationFactory> */
    use HasFactory;

    protected static function newFactory()
    {
        return FamilyRelationFactory::new();
    }
}
