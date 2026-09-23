<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanCollateralRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['DEPOSIT_LIEN', 'PROPERTY', 'VEHICLE', 'GUARANTEE', 'OTHER'])],
            'description' => ['required', 'string', 'max:255'],
            'assessed_value' => ['nullable', 'numeric', 'gte:0'],
            'secured_value' => ['nullable', 'numeric', 'gte:0', 'lte:assessed_value'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
