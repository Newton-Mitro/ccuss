<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'customer_id' => ['required', 'integer', Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'financial_product_id' => ['required', 'integer', Rule::exists('loan_products', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)->where('status', true))],
            'requested_amount' => ['required', 'numeric', 'gt:0'],
            'requested_term_months' => ['required', 'integer', 'min:1', 'max:600'],
            'purpose' => ['nullable', 'string', 'max:5000'],
            'income_details' => ['sometimes', 'array', 'max:50'],
            'income_details.*.source' => ['required', 'string', 'max:120'],
            'income_details.*.monthly_amount' => ['required', 'numeric', 'min:0'],
            'income_details.*.notes' => ['nullable', 'string', 'max:2000'],
            'expense_details' => ['sometimes', 'array', 'max:50'],
            'expense_details.*.category' => ['required', 'string', 'max:120'],
            'expense_details.*.monthly_amount' => ['required', 'numeric', 'min:0'],
            'expense_details.*.notes' => ['nullable', 'string', 'max:2000'],
            'job_histories' => ['sometimes', 'array', 'max:50'],
            'job_histories.*.employer_name' => ['required', 'string', 'max:180'],
            'job_histories.*.job_title' => ['nullable', 'string', 'max:120'],
            'job_histories.*.employment_type' => ['nullable', 'string', 'max:60'],
            'job_histories.*.start_date' => ['nullable', 'date'],
            'job_histories.*.end_date' => ['nullable', 'date', 'after_or_equal:job_histories.*.start_date'],
            'job_histories.*.monthly_income' => ['nullable', 'numeric', 'min:0'],
            'job_histories.*.is_current' => ['sometimes', 'boolean'],
            'job_histories.*.notes' => ['nullable', 'string', 'max:2000'],
            'asset_details' => ['sometimes', 'array', 'max:50'],
            'asset_details.*.asset_type' => ['required', 'string', 'max:100'],
            'asset_details.*.description' => ['required', 'string', 'max:255'],
            'asset_details.*.estimated_value' => ['nullable', 'numeric', 'min:0'],
            'asset_details.*.ownership_status' => ['nullable', 'string', 'max:80'],
            'asset_details.*.notes' => ['nullable', 'string', 'max:2000'],
            'educations' => ['sometimes', 'array', 'max:50'],
            'educations.*.institution_name' => ['required', 'string', 'max:180'],
            'educations.*.qualification' => ['nullable', 'string', 'max:120'],
            'educations.*.field_of_study' => ['nullable', 'string', 'max:120'],
            'educations.*.start_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'educations.*.end_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'educations.*.notes' => ['nullable', 'string', 'max:2000'],
            'supporting_documents' => ['sometimes', 'array', 'max:10'],
            'supporting_documents.*.document_type' => ['required', 'string', 'max:100'],
            'supporting_documents.*.file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
        ];
    }
}