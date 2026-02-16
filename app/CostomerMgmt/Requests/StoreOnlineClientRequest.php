<?php

namespace App\CostomerMgmt\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOnlineClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => [
                'required',
                'integer',
                'exists:customers,id',
                'unique:online_service_users,customer_id',
            ],

            'username' => [
                'required',
                'string',
                'max:100',
                'unique:online_service_users,username',
            ],

            'email' => [
                'nullable',
                'email',
                'max:150',
                'unique:online_service_users,email',
                'required_without:phone',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:20',
                'unique:online_service_users,phone',
                'required_without:email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'status' => [
                'sometimes',
                Rule::in(['ACTIVE', 'SUSPENDED', 'CLOSED']),
            ],
        ];
    }
}
