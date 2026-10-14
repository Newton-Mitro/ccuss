export type IncomeDetail = {
    source: string;
    monthly_amount: string;
    notes: string;
};

export type ExpenseDetail = {
    category: string;
    monthly_amount: string;
    notes: string;
};

export type JobHistory = {
    employer_name: string;
    job_title: string;
    employment_type: string;
    start_date: string;
    end_date: string;
    monthly_income: string;
    is_current: boolean;
    notes: string;
};

export type AssetDetail = {
    asset_type: string;
    description: string;
    estimated_value: string;
    ownership_status: string;
    notes: string;
};

export type EducationDetail = {
    institution_name: string;
    qualification: string;
    field_of_study: string;
    start_year: string;
    end_year: string;
    notes: string;
};

export type SupportingDocument = {
    document_type: string;
    file: File | null;
};

export type LoanApplicationFormData = {
    _method: 'put' | 'post';
    customer_id: string;
    financial_product_id: string;
    loan_protection_product_id: string;
    requested_amount: string;
    requested_term_months: string;
    purpose: string;
    income_details: IncomeDetail[];
    expense_details: ExpenseDetail[];
    job_histories: JobHistory[];
    asset_details: AssetDetail[];
    educations: EducationDetail[];
    supporting_documents: SupportingDocument[];
};

export type FormErrors = Record<string, string | undefined>;

export type SectionProps<T> = {
    rows: T[];
    onChange: (rows: T[]) => void;
    errors?: FormErrors;
};

export function updateRow<T extends object>(
    rows: T[],
    rowIndex: number,
    key: keyof T,
    value: unknown,
): T[] {
    return rows.map((row, index) =>
        index === rowIndex ? ({ ...row, [key]: value } as T) : row,
    );
}
