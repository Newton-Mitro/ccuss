<?php

namespace App\PettyCashModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashAccount extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'name',
        'branch_id',
        'current_balance',
        'status',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'current_balance' => 'decimal:2',
        'status' => 'string', // enum handled as string
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function pettyCashAdvances()
    {
        return $this->hasMany(PettyCashAdvance::class);
    }
}