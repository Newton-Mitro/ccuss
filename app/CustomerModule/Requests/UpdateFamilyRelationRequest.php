<?php

namespace App\CustomerModule\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFamilyRelationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $relations = [
            'FATHER',
            'MOTHER',
            'SON',
            'DAUGHTER',
            'BROTHER',
            'SISTER',
            'HUSBAND',
            'WIFE',
            'GRANDFATHER',
            'GRANDMOTHER',
            'UNCLE',
            'AUNT',
            'NEPHEW',
            'NIECE',
            'FATHER_IN_LAW',
            'MOTHER_IN_LAW',
            'SON_IN_LAW',
            'DAUGHTER_IN_LAW',
            'BROTHER_IN_LAW',
            'SISTER_IN_LAW',
        ];

        $relationId = $this->route('family_relation')?->id
            ?? $this->route('family_relation'); // supports both binding styles

        return [
            'customer_id' => ['required', 'exists:customers,id'],

            // 'relative_id' => [
            //     'required',
            //     'exists:customers,id',
            //     'different:customer_id',

            //     // ✅ Ignore current record while checking uniqueness
            //     Rule::unique('customer_family_relations')
            //         ->ignore($relationId)
            //         ->where(
            //             fn($q) =>
            //             $q->where('customer_id', $this->customer_id)
            //         ),
            // ],

            'relation_type' => ['required', Rule::in($relations)],
        ];
    }

    public function messages(): array
    {
        return [
            'relative_id.different' => 'Customer and relative must be different.',
            'relative_id.unique' => 'This relation already exists.',
        ];
    }
}