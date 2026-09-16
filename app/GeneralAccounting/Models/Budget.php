<?php

namespace App\GeneralAccounting\Models;

use App\SystemAdministration\Models\Organization;
use App\GeneralAccounting\Models\BudgetEntry;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\BudgetFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'fiscal_year_id',
        'name',
        'status',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(BudgetEntry::class);
    }
}
