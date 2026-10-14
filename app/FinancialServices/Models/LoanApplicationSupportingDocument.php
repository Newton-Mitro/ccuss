<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApplicationSupportingDocument extends Model
{
    protected $table = 'loan_application_supporting_documents';

    protected $fillable = ['document_type', 'file_name', 'file_path', 'mime_type', 'file_size'];

    protected $hidden = ['file_path'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }
}