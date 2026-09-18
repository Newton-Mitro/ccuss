<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpenBranchDayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('branch_days.open') ?? false;
    }

    public function rules(): array
    {
        return [
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where(
                    fn($query) => $query->where('organization_id', $this->activeOrganizationId()),
                ),
            ],
            'business_date' => ['required', 'date'],
        ];
    }

    private function activeOrganizationId(): int
    {
        return (int) $this->attributes->get('active_organization')->id;
    }
}
