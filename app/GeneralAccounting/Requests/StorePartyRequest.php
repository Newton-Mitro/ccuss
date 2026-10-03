<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePartyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;
        $partyId = $this->route('party')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('parties', 'code')
                    ->where(fn($query) => $query->where('organization_id', $organizationId))
                    ->ignore($partyId),
            ],
            'name' => ['required', 'string', 'max:150'],
            'party_type' => ['required', Rule::in(['CUSTOMER', 'SUPPLIER', 'CUSTOMER_SUPPLIER', 'EMPLOYEE', 'OTHER'])],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:254'],
            'address' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'boolean'],
        ];
    }
}