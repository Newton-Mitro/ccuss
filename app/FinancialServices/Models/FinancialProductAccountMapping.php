<?php

namespace App\FinancialServices\Models;

use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialProductAccountMapping extends Model
{
    use HasFactory;

    protected $table = 'gl_account_mappings';

    protected static function newFactory()
    {
        return \Database\Factories\FinancialProductAccountMappingFactory::new();
    }

    protected $fillable = [
        'organization_id',
        'financial_product_id',
        'source_type',
        'source_code',
        'transaction_type',
        'debit_account_id',
        'credit_account_id',
        'status',
    ];

    protected $casts = ['status' => 'boolean'];

    protected static function booted(): void
    {
        static::addGlobalScope('financial_product', fn(Builder $query) => $query->where('source_type', 'FINANCIAL_PRODUCT'));

        static::creating(function (self $mapping): void {
            $product = FinancialProduct::query()
                ->select(['id', 'organization_id'])
                ->findOrFail($mapping->financial_product_id);

            $mapping->organization_id = $product->organization_id;
            $mapping->source_type = 'FINANCIAL_PRODUCT';
            $mapping->source_code = (string) $product->id;
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }

    public function debitAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'debit_account_id');
    }

    public function creditAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'credit_account_id');
    }
}