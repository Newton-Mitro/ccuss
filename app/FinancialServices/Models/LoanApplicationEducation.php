<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApplicationEducation extends Model
{
    protected $table = 'loan_application_educations';

    protected $fillable = ['institution_name', 'qualification', 'field_of_study', 'start_year', 'end_year', 'notes'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }
}