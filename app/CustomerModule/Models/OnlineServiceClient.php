<?php

namespace App\CustomerModule\Models;

use App\Audit\Traits\Auditable;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use Database\Factories\OnlineServiceClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnlineServiceClient extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'organization_id',
        'branch_id',
        'customer_id',
        'username',
        'email',
        'phone',
        'password',
        'last_login_at',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    /* ========================
     * Core Relationships
     * ======================== */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /* ========================
     * Audit
     * ======================== */

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    protected static function newFactory()
    {
        return OnlineServiceClientFactory::new();
    }
}