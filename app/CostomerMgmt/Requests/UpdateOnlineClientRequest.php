<?php

namespace App\CostomerMgmt\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOnlineClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $onlineUserId = $this->route('online_service_user')
            ?? $this->route('id');

        return [
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('online_service_users', 'username')->ignore($onlineUserId),
            ],

            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('online_service_users', 'email')->ignore($onlineUserId),
            ],

            'phone' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('online_service_users', 'phone')->ignore($onlineUserId),
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],

            'status' => [
                'required',
                Rule::in(['ACTIVE', 'SUSPENDED', 'CLOSED']),
            ],
        ];
    }
}
