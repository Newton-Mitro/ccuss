<?php

namespace App\FinancialServices\Requests;

use App\CustomerModule\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'financial_product_id' => [
                'nullable',
                'integer',
                Rule::exists('financial_products', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'financial_product_term_id' => [
                'nullable',
                'integer',
                Rule::exists('financial_product_terms', 'id')->where(fn($query) => $query->where('financial_product_id', $this->input('financial_product_id'))),
            ],
            'holder_type' => ['nullable', Rule::in(['customer'])],
            'holder_id' => [
                'required_if:account_type,SAVINGS,FIXED_DEPOSIT,RECURRING_DEPOSIT,SHARE,LOAN',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'account_no' => ['required_unless:account_type,SAVINGS,SHARE,FIXED_DEPOSIT,RECURRING_DEPOSIT', 'nullable', 'string', 'max:100'],
            'name' => ['nullable', 'string', 'max:200'],
            'account_type' => ['required', Rule::in(['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CASH', 'BANK', 'OTHER'])],
            'metadata' => ['nullable', 'array'],
            'joint_holder_ids' => ['nullable', 'array'],
            'joint_holder_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'guardian_customer_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'minimum_balance' => ['nullable', 'numeric', 'gte:0'],
            'membership_no' => ['nullable', 'string', 'max:100'],
            'member_since' => ['nullable', 'date'],
            'membership_status' => ['nullable', Rule::in(['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])],
            'principal_amount' => ['nullable', 'numeric', 'gt:0'],
            'contractual_rate' => ['nullable', 'numeric', 'gte:0'],
            'term_months' => ['nullable', 'integer', 'min:1', 'max:600'],
            'started_at' => ['nullable', 'date'],
            'maturity_instruction' => ['nullable', Rule::in(['PAYOUT', 'RENEW_PRINCIPAL', 'RENEW_PRINCIPAL_AND_INTEREST'])],
            'installment_amount' => ['nullable', 'numeric', 'gt:0'],
            'installment_frequency' => ['nullable', Rule::in(['WEEKLY', 'MONTHLY', 'QUARTERLY'])],
            'total_installments' => ['nullable', 'integer', 'min:1', 'max:600'],
            'maturity_extension_days' => ['nullable', 'integer', 'min:0'],
            'grace_days' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->has('holder_id') || !$this->filled('holder_id')) {
                return;
            }

            $organizationId = (int) $this->attributes->get('active_organization')?->id;
            $holder = Customer::query()
                ->where('organization_id', $organizationId)
                ->find($this->input('holder_id'));

            if (
                !$holder
                || $holder->type !== Customer::TYPE_INDIVIDUAL
                || !$holder->dob
                || $holder->dob->age >= 18
            ) {
                return;
            }

            $guardian = Customer::query()
                ->where('organization_id', $organizationId)
                ->find($this->input('guardian_customer_id'));

            if (
                !$guardian
                || $guardian->id === $holder->id
                || $guardian->type !== Customer::TYPE_INDIVIDUAL
                || !$guardian->dob
                || $guardian->dob->age < 18
            ) {
                $validator->errors()->add(
                    'guardian_customer_id',
                    'Select an adult individual guardian for a minor account holder.',
                );
            }
        });
    }
}
