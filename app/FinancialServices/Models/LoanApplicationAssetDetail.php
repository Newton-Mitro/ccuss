<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApplicationAssetDetail extends Model
{
    protected $table = 'loan_application_asset_details';

    protected $fillable = ['asset_type', 'description', 'estimated_value', 'ownership_status', 'notes'];

    protected $casts = ['estimated_value' => 'decimal:2'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }
}