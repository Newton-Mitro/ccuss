<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanGuarantorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['customer_id' => ['required', 'integer', 'exists:customers,id'], 'notes' => ['nullable', 'string', 'max:5000']];
    }
}