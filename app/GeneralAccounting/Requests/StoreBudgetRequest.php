<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'name' => ['required', 'string', 'max:150'],
            'fiscal_year_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_years', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'entries' => ['array'],
            'entries.*.account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'entries.*.cost_center_id' => ['nullable', 'integer', Rule::exists('cost_centers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'entries.*.fiscal_period_id' => ['nullable', 'integer', Rule::exists('fiscal_periods', 'id')],
            'entries.*.amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
