<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\ShareDividendAllocation;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShareDividendDeclaration extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'fiscal_year_id',
        'declaration_no',
        'declaration_date',
        'dividend_rate',
        'total_basis_amount',
        'total_dividend_amount',
        'status',
        'approved_by',
        'approved_at',
        'note',
    ];

    protected $casts = [
        'declaration_date' => 'date',
        'dividend_rate' => 'decimal:6',
        'total_basis_amount' => 'decimal:4',
        'total_dividend_amount' => 'decimal:4',
        'approved_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(ShareDividendAllocation::class);
    }
}
