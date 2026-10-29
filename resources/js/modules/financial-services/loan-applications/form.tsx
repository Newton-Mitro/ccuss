import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import AssetDetailsSection from '@/modules/financial-services/loan-applications/components/asset-details-section';
import EducationSection from '@/modules/financial-services/loan-applications/components/education-section';
import ExpenseDetailsSection from '@/modules/financial-services/loan-applications/components/expense-details-section';
import FormActions from '@/modules/financial-services/loan-applications/components/form-actions';
import IncomeDetailsSection from '@/modules/financial-services/loan-applications/components/income-details-section';
import JobHistorySection from '@/modules/financial-services/loan-applications/components/job-history-section';
import LoanApplicationHeader from '@/modules/financial-services/loan-applications/components/loan-application-header';
import LoanBasicDetails from '@/modules/financial-services/loan-applications/components/loan-basic-details';
import SupportingDocumentsSection from '@/modules/financial-services/loan-applications/components/supporting-documents-section';
import { LoanApplicationFormData } from '@/modules/financial-services/loan-applications/types';
import type { LoanApplicationFormPageProps } from '@/modules/financial-services/types/financial-services';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    BriefcaseBusiness,
    Check,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    GraduationCap,
    Home,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

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

    const selectedCustomer = customers.find(
        (customer) => String(customer.id) === data.customer_id,
    );
    const selectedProduct = products.find(
        (product) => String(product.id) === data.financial_product_id,
    );
    const selectedProtection = protectionProducts.find(
        (product) => String(product.id) === data.loan_protection_product_id,
    );
    const monthlyIncome = data.income_details.reduce(
        (total, item) => total + (Number(item.monthly_amount) || 0),
        0,
    );
    const monthlyExpenses = data.expense_details.reduce(
        (total, item) => total + (Number(item.monthly_amount) || 0),
        0,
    );
    const formatRate = (value: string | number) =>
        `${Number(value).toFixed(2)}%`;

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
            <div className="!w-full !max-w-none min-w-0 space-y-5 pb-4">
                <LoanApplicationHeader
                    applicationNo={application?.application_no}
                    isEditing={Boolean(application)}
                />

                <form
                    onSubmit={submit}
                    className="w-full min-w-0 rounded-2xl border bg-card shadow-sm"
                >
                    <div className="grid min-w-0 items-start gap-6 p-4 sm:p-6 lg:p-7 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
                            <section className="col-span-full w-full min-w-0 space-y-3 rounded-xl border bg-muted/10 p-4 sm:p-5">
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
                                    className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7"
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
                                            className="h-auto min-h-10 w-full justify-start px-2 text-left"
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
                                            <span className="truncate">
                                                {step}
                                            </span>
                                        </Button>
                                    ))}
                                </nav>
                            </section>

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
                                        setData(
                                            'loan_protection_product_id',
                                            value,
                                        )
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
                                    onChange={(rows) =>
                                        setData('educations', rows)
                                    }
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

                            <div className="col-span-full flex w-full items-center justify-between border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={activeStep === 0}
                                    size="sm"
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
                                    size="sm"
                                    onClick={() =>
                                        setActiveStep((step) =>
                                            Math.min(
                                                steps.length - 1,
                                                step + 1,
                                            ),
                                        )
                                    }
                                >
                                    Next <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                        <aside className="min-w-0 space-y-4 px-4 pb-5 sm:px-6 lg:px-7 xl:sticky xl:top-4 xl:px-0 xl:pr-7 xl:pb-0">
                            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                                <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Eye className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                                Application overview
                                            </p>
                                            <h2 className="text-sm font-semibold">
                                                Live preview
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                <div className="max-h-[70vh] space-y-3 overflow-y-auto p-3 xl:max-h-[calc(100dvh-8rem)]">
                                    <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Applicant
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <UserRound className="size-4 shrink-0 text-primary" />
                                            <p className="min-w-0 text-sm font-semibold break-words">
                                                {selectedCustomer?.name ||
                                                    'Select a customer'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Banknote className="size-4 text-primary" />
                                            Requested amount
                                        </div>
                                        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                            {formatBDTCurrency(
                                                data.requested_amount || 0,
                                            )}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {data.requested_term_months || '—'}{' '}
                                            months
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            {
                                                label: 'Loan product',
                                                value: selectedProduct
                                                    ? `${selectedProduct.code} — ${selectedProduct.name}`
                                                    : 'Not selected',
                                            },
                                            {
                                                label: 'Credit-life insurance',
                                                value: selectedProtection
                                                    ? `${selectedProtection.code} — ${selectedProtection.name}`
                                                    : 'Not selected',
                                            },
                                            ...(selectedProtection
                                                ? [
                                                      {
                                                          label: 'Insurance rate',
                                                          value: formatRate(
                                                              selectedProtection.monthly_rate_percent,
                                                          ),
                                                      },
                                                  ]
                                                : []),
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
                                            >
                                                <span className="text-xs text-muted-foreground">
                                                    {item.label}
                                                </span>
                                                <span className="min-w-0 text-right text-xs font-medium break-words">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-xl border border-border/60 p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <ClipboardList className="size-4 text-primary" />
                                            <p className="text-xs font-semibold">
                                                Financial summary
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                {
                                                    label: 'Monthly income',
                                                    value: formatBDTCurrency(
                                                        monthlyIncome,
                                                    ),
                                                },
                                                {
                                                    label: 'Monthly expenses',
                                                    value: formatBDTCurrency(
                                                        monthlyExpenses,
                                                    ),
                                                },
                                                {
                                                    label: 'Monthly surplus',
                                                    value: formatBDTCurrency(
                                                        monthlyIncome -
                                                            monthlyExpenses,
                                                    ),
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center justify-between gap-2 text-xs"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {item.label}
                                                    </span>
                                                    <span className="font-medium tabular-nums">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="px-1 text-xs font-semibold">
                                            Supporting details
                                        </p>
                                        {[
                                            {
                                                label: 'Employment records',
                                                value: data.job_histories
                                                    .length,
                                                icon: BriefcaseBusiness,
                                            },
                                            {
                                                label: 'Assets',
                                                value: data.asset_details
                                                    .length,
                                                icon: Home,
                                            },
                                            {
                                                label: 'Education records',
                                                value: data.educations.length,
                                                icon: GraduationCap,
                                            },
                                            {
                                                label: 'Documents added',
                                                value: data.supporting_documents
                                                    .length,
                                                icon: ShieldCheck,
                                            },
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2"
                                                >
                                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Icon className="size-3.5" />
                                                        {item.label}
                                                    </span>
                                                    <span className="text-xs font-semibold tabular-nums">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {data.purpose.trim() && (
                                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                Loan purpose
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed break-words">
                                                {data.purpose}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </aside>
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
