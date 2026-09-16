<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFiscalPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'fiscal_year_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_years', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'name' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['nullable', Rule::in(['OPEN', 'CLOSED'])],
        ];
    }
}
