<?php

namespace App\SystemAdministration\Models;

use App\SystemAdministration\Traits\Auditable;
use Database\Factories\OrganizationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Organization extends Model
{

    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'short_name',
        'registration_no',
        'tax_id',
        'phone',
        'email',
        'website',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'logo_path',
        'report_footer',
    ];

    /**
     * Append computed attributes
     */
    protected $appends = [
        'full_address',
        'logo_url',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_user')
            ->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getFullAddressAttribute()
    {
        return collect([
            $this->address_line1,
            $this->address_line2,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country
        ])->filter()->implode(', ');
    }

    public function getLogoUrlAttribute()
    {
        if (!$this->logo_path) {
            return null; // or return asset('images/default-logo.png');
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    protected static function newFactory()
    {
        return OrganizationFactory::new();
    }
}