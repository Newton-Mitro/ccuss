<?php

namespace App\PettyCashModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PettyCashAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'branch_id',
        'custodian_id',
        'imprest_amount',
        'current_balance',
        'is_active',
    ];

    // Relations
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function custodian()
    {
        return $this->belongsTo(User::class, 'custodian_id');
    }

    public function vouchers()
    {
        return $this->hasMany(PettyCashVoucher::class);
    }

    public function replenishments()
    {
        return $this->hasMany(PettyCashReplenishment::class);
    }

    public function journals()
    {
        return $this->morphMany(PettyCashTransaction::class, 'reference');
    }
}