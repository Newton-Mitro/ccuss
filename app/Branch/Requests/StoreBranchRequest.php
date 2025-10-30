<?php

namespace App\Branch\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:20',
                'unique:branches,code',
            ],
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'address' => [
                'nullable',
                'string',
                'max:255',
            ],
            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
            ],
            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
            ],
            'manager_id' => [
                'nullable',
                'exists:customers,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Branch code is required.',
            'code.unique' => 'This branch code is already in use.',
            'name.required' => 'Please enter the branch name.',
            'latitude.between' => 'Latitude must be between -90 and 90.',
            'longitude.between' => 'Longitude must be between -180 and 180.',
            'manager_id.exists' => 'The selected manager does not exist.',
        ];
    }
}
