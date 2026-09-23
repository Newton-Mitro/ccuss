<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\FinancialServices\Models\FinancialTransactionEntry;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\FinancialTransactionFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'branch_id',
        'transaction_no',
        'idempotency_key',
        'transaction_type',
        'transaction_date',
        'amount',
        'currency',
        'status',
        'reference',
        'description',
        'source_type',
        'source_id',
        'created_by',
        'posted_by',
        'posted_at',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'amount' => 'decimal:4',
        'posted_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function entries(): HasMany
    {
        return $this->hasMany(FinancialTransactionEntry::class);
    }
}