<?php

namespace App\CostomerManagement\FamilyRelation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFamilyRelationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Adjust if you have authorization logic
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
            'COUSIN_BROTHER',
            'COUSIN_SISTER',
            'SISTER',
            'HUSBAND',
            'WIFE',
            'GRANDFATHER',
            'GRANDMOTHER',
            'GRANDSON',
            'GRANDDAUGHTER',
            'UNCLE',
            'AUNT',
            'NEPHEW',
            'NIECE',
            'FATHER-IN-LAW',
            'MOTHER-IN-LAW',
            'SON-IN-LAW',
            'DAUGHTER-IN-LAW',
            'BROTHER-IN-LAW',
            'SISTER-IN-LAW',
        ];

        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'relative_id' => ['required', 'exists:customers,id', 'different:customer_id'],
            'relation_type' => ['required', 'in:' . implode(',', $relations)],
            'reverse_relation_type' => ['required', 'in:' . implode(',', $relations)],
        ];
    }

    public function messages(): array
    {
        return [
            'relative_id.different' => 'Customer and relative must be different.',
        ];
    }
}