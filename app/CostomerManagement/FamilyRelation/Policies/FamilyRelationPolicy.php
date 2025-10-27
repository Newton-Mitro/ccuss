<?php

namespace App\CostomerManagement\FamilyRelation\Policies;

use App\CostomerManagement\FamilyRelation\Models\FamilyRelation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FamilyRelationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, FamilyRelation $familyRelation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, FamilyRelation $familyRelation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, FamilyRelation $familyRelation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, FamilyRelation $familyRelation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, FamilyRelation $familyRelation): bool
    {
        return false;
    }
}
