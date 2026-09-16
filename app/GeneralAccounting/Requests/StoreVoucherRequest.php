<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'fiscal_period_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_periods', 'id')->where(function ($query) use ($organizationId) {
                    $query->whereExists(function ($subquery) use ($organizationId) {
                        $subquery
                            ->selectRaw('1')
                            ->from('fiscal_years')
                            ->whereColumn('fiscal_years.id', 'fiscal_periods.fiscal_year_id')
                            ->where('organization_id', $organizationId);
                    });
                }),
            ],
            'branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'voucher_type' => ['required', Rule::in(['JOURNAL', 'PAYMENT', 'RECEIPT', 'CONTRA', 'OPENING', 'ADJUSTMENT', 'CLOSING', 'SYSTEM'])],
            'voucher_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
            'entries' => ['required', 'array', 'min:2'],
            'entries.*.account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries.*.branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries.*.cost_center_id' => [
                'nullable',
                'integer',
                Rule::exists('cost_centers', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries.*.description' => ['nullable', 'string', 'max:500'],
            'entries.*.debit' => ['nullable', 'numeric', 'min:0'],
            'entries.*.credit' => ['nullable', 'numeric', 'min:0'],
            'entries.*.reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
