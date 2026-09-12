<?php

namespace App\SystemAdministration\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'organization_id' => ['required', 'exists:organizations,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
            'status' => ['nullable', 'in:active,inactive'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
