<?php

namespace App\SystemAdministration\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'organization_id' => ['required', 'exists:organizations,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
            'status' => ['nullable', 'in:active,inactive'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
