<?php

namespace App\TreasuryAndCash\Requests;

use App\TreasuryAndCash\Models\PettyCashFund;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePettyCashFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $fund = $this->route('fund');
        $fundId = $fund instanceof PettyCashFund ? $fund->id : null;
        $cashLocationId = $fund instanceof PettyCashFund ? $fund->cash_location_id : null;

        return [
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where(
                    fn($query) => $query->where(
                        'organization_id',
                        $this->attributes->get('active_organization')?->id,
                    ),
                ),
            ],
            'custodian_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(
                    fn($query) => $query->where(function ($userQuery): void {
                        $organizationId = $this->attributes->get('active_organization')?->id;

                        $userQuery
                            ->where('organization_id', $organizationId)
                            ->orWhereExists(function ($membershipQuery) use ($organizationId): void {
                                $membershipQuery
                                    ->selectRaw('1')
                                    ->from('organization_user')
                                    ->whereColumn('organization_user.user_id', 'users.id')
                                    ->where('organization_user.organization_id', $organizationId);
                            });
                    }),
                ),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('petty_cash_funds', 'code')->ignore($fundId),
                Rule::unique('cash_locations', 'code')->where(
                    fn($query) => $query->where(
                        'organization_id',
                        $this->attributes->get('active_organization')?->id,
                    ),
                )->ignore($cashLocationId),
            ],
            'name' => ['required', 'string', 'max:150'],
            'fund_limit' => ['required', 'numeric', 'min:0'],
            'current_balance' => ['nullable', 'numeric', 'min:0'],
            'method' => ['nullable', 'in:IMPREST,VARIABLE'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
