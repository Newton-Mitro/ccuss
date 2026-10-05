<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTellerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => [
                $this->isMethod('post') ? 'required' : 'sometimes',
                'integer',
                Rule::exists('branches', 'id')->where(
                    fn($query) => $query->where(
                        'organization_id',
                        $this->attributes->get('active_organization')?->id,
                    ),
                ),
            ],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'maximum_cash' => ['nullable', 'numeric', 'gte:0'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
