import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import type { LoanApplicationFormPageProps } from '@/types/financial-services';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import AssetDetailsSection from './components/asset-details-section';
import EducationSection from './components/education-section';
import ExpenseDetailsSection from './components/expense-details-section';
import FormActions from './components/form-actions';
import IncomeDetailsSection from './components/income-details-section';
import JobHistorySection from './components/job-history-section';
import LoanApplicationHeader from './components/loan-application-header';
import LoanBasicDetails from './components/loan-basic-details';
import SupportingDocumentsSection from './components/supporting-documents-section';
import { LoanApplicationFormData } from './types';

export default function LoanApplicationForm() {
    const {
        customers,
        products,
        protectionProducts,
        application,
        can_view_supporting_documents: canViewSupportingDocuments,
    } = usePage<LoanApplicationFormPageProps>().props;

    const { data, setData, post, processing, errors } =
        useForm<LoanApplicationFormData>({
            _method: application ? 'put' : 'post',
            customer_id: application ? String(application.customer_id) : '',
            financial_product_id: application
                ? String(
                      application.loan_product_id ??
                          application.financial_product_id ??
                          '',
                  )
                : '',
            loan_protection_product_id: application?.loan_protection_product_id
                ? String(application.loan_protection_product_id)
                : '',
            requested_amount: application
                ? String(application.requested_amount)
                : '',
            requested_term_months: application
                ? String(application.requested_term_months ?? 12)
                : '12',
            purpose: application?.purpose ?? '',
            income_details:
                application?.income_details?.map(
                    ({ source, monthly_amount, notes }) => ({
                        source,
                        monthly_amount: String(monthly_amount),
                        notes: notes ?? '',
                    }),
                ) ?? [],
            expense_details:
                application?.expense_details?.map(
                    ({ category, monthly_amount, notes }) => ({
                        category,
                        monthly_amount: String(monthly_amount),
                        notes: notes ?? '',
                    }),
                ) ?? [],
            job_histories:
                application?.job_histories?.map((job) => ({
                    employer_name: job.employer_name,
                    job_title: job.job_title ?? '',
                    employment_type: job.employment_type ?? '',
                    start_date: job.start_date ?? '',
                    end_date: job.end_date ?? '',
                    monthly_income: String(job.monthly_income ?? ''),
                    is_current: job.is_current,
                    notes: job.notes ?? '',
                })) ?? [],
            asset_details:
                application?.asset_details?.map((asset) => ({
                    asset_type: asset.asset_type,
                    description: asset.description,
                    estimated_value: String(asset.estimated_value ?? ''),
                    ownership_status: asset.ownership_status ?? '',
                    notes: asset.notes ?? '',
                })) ?? [],
            educations:
                application?.educations?.map((education) => ({
                    institution_name: education.institution_name,
                    qualification: education.qualification ?? '',
                    field_of_study: education.field_of_study ?? '',
                    start_year: String(education.start_year ?? ''),
                    end_year: String(education.end_year ?? ''),
                    notes: education.notes ?? '',
                })) ?? [],
            supporting_documents: [],
        });
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        'Loan request',
        'Income',
        'Expenses',
        'Employment',
        'Assets',
        'Education',
        'Documents',
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Applications', href: route('loan-applications.index') },
        { title: application ? 'Edit Draft' : 'New Application', href: '' },
    ];

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (application) {
            post(route('loan-applications.update', application.id), {
                forceFormData: true,
            });
        } else {
            post(route('loan-applications.store'), { forceFormData: true });
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    application
                        ? 'Edit Loan Application'
                        : 'New Loan Application'
                }
            />
            <div className="w-full max-w-5xl space-y-5 pb-4">
                <LoanApplicationHeader
                    applicationNo={application?.application_no}
                    isEditing={Boolean(application)}
                />

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                >
                    <div className="grid gap-6 p-4 sm:p-6 lg:p-7">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                    Step {activeStep + 1} of {steps.length}
                                </span>
                                <span className="text-muted-foreground">
                                    {steps[activeStep]}
                                </span>
                            </div>
                            <div
                                className="h-1.5 overflow-hidden rounded-full bg-muted"
                                role="progressbar"
                                aria-valuenow={activeStep + 1}
                                aria-valuemin={1}
                                aria-valuemax={steps.length}
                                aria-label="Loan application progress"
                            >
                                <div
                                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                                    style={{
                                        width: `${((activeStep + 1) / steps.length) * 100}%`,
                                    }}
                                />
                            </div>
                            <nav
                                aria-label="Application steps"
                                className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7"
                            >
                                {steps.map((step, index) => (
                                    <Button
                                        key={step}
                                        type="button"
                                        variant={
                                            activeStep === index
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="h-auto min-h-10 justify-start px-2 text-left"
                                        disabled={index > activeStep}
                                        aria-current={
                                            activeStep === index
                                                ? 'step'
                                                : undefined
                                        }
                                        onClick={() => setActiveStep(index)}
                                    >
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs">
                                            {activeStep > index ? (
                                                <Check className="size-3" />
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        <span className="truncate">{step}</span>
                                    </Button>
                                ))}
                            </nav>
                        </div>

                        {activeStep === 0 && (
                            <LoanBasicDetails
                                customers={customers}
                                products={products}
                                protectionProducts={protectionProducts}
                                customerId={data.customer_id}
                                productId={data.financial_product_id}
                                protectionProductId={
                                    data.loan_protection_product_id
                                }
                                amount={data.requested_amount}
                                term={data.requested_term_months}
                                purpose={data.purpose}
                                errors={errors}
                                onCustomerChange={(value) =>
                                    setData('customer_id', value)
                                }
                                onProductChange={(value) =>
                                    setData('financial_product_id', value)
                                }
                                onProtectionProductChange={(value) =>
                                    setData('loan_protection_product_id', value)
                                }
                                onAmountChange={(value) =>
                                    setData('requested_amount', value)
                                }
                                onTermChange={(value) =>
                                    setData('requested_term_months', value)
                                }
                                onPurposeChange={(value) =>
                                    setData('purpose', value)
                                }
                            />
                        )}
                        {activeStep === 1 && (
                            <IncomeDetailsSection
                                rows={data.income_details}
                                onChange={(rows) =>
                                    setData('income_details', rows)
                                }
                            />
                        )}
                        {activeStep === 2 && (
                            <ExpenseDetailsSection
                                rows={data.expense_details}
                                onChange={(rows) =>
                                    setData('expense_details', rows)
                                }
                            />
                        )}
                        {activeStep === 3 && (
                            <JobHistorySection
                                rows={data.job_histories}
                                onChange={(rows) =>
                                    setData('job_histories', rows)
                                }
                            />
                        )}
                        {activeStep === 4 && (
                            <AssetDetailsSection
                                rows={data.asset_details}
                                onChange={(rows) =>
                                    setData('asset_details', rows)
                                }
                            />
                        )}
                        {activeStep === 5 && (
                            <EducationSection
                                rows={data.educations}
                                onChange={(rows) => setData('educations', rows)}
                            />
                        )}
                        {activeStep === 6 && (
                            <SupportingDocumentsSection
                                rows={data.supporting_documents}
                                onChange={(rows) =>
                                    setData('supporting_documents', rows)
                                }
                                existingDocuments={
                                    application?.supporting_documents
                                }
                                applicationId={application?.id}
                                canViewExisting={canViewSupportingDocuments}
                                errors={errors}
                            />
                        )}

                        <div className="flex items-center justify-between border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={activeStep === 0}
                                onClick={() =>
                                    setActiveStep((step) =>
                                        Math.max(0, step - 1),
                                    )
                                }
                            >
                                <ChevronLeft className="size-4" /> Previous
                            </Button>
                            <Button
                                type="button"
                                disabled={activeStep === steps.length - 1}
                                onClick={() =>
                                    setActiveStep((step) =>
                                        Math.min(steps.length - 1, step + 1),
                                    )
                                }
                            >
                                Next <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <FormActions
                        cancelHref={route('loan-applications.index')}
                        processing={processing}
                        isEditing={Boolean(application)}
                    />
                </form>
            </div>
        </CustomAuthLayout>
    );
}
