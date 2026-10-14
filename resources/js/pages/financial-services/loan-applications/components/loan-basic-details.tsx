import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { LoanApplicationFormPageProps } from '@/types/financial-services';
import { FormErrors } from '../types';

type Props = {
    customers: LoanApplicationFormPageProps['customers'];
    products: LoanApplicationFormPageProps['products'];
    protectionProducts: LoanApplicationFormPageProps['protectionProducts'];
    customerId: string;
    productId: string;
    protectionProductId: string;
    amount: string;
    term: string;
    purpose: string;
    errors: FormErrors;
    onCustomerChange: (value: string) => void;
    onProductChange: (value: string) => void;
    onProtectionProductChange: (value: string) => void;
    onAmountChange: (value: string) => void;
    onTermChange: (value: string) => void;
    onPurposeChange: (value: string) => void;
};

export default function LoanBasicDetails(props: Props) {
    const {
        customers,
        products,
        protectionProducts,
        customerId,
        productId,
        protectionProductId,
        amount,
        term,
        purpose,
        errors,
        onCustomerChange,
        onProductChange,
        onProtectionProductChange,
        onAmountChange,
        onTermChange,
        onPurposeChange,
    } = props;

    return (
        <section className="space-y-4 sm:col-span-2">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-primary">
                    <span className="text-sm font-bold">01</span>
                </div>
                <div>
                    <h2 className="text-sm font-semibold">Loan request</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Choose the applicant, product, amount, and repayment
                        term.
                    </p>
                </div>
            </div>
            <div className="grid gap-4 rounded-xl border bg-background p-4 sm:grid-cols-2 sm:p-5">
                <div className="min-w-0 space-y-1.5">
                    <Label>
                        Customer <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={customerId}
                        onChange={onCustomerChange}
                        options={[
                            { value: '', label: 'Select customer' },
                            ...customers.map((customer) => ({
                                value: String(customer.id),
                                label: `${customer.customer_no} - ${customer.name}`,
                            })),
                        ]}
                    />
                    <InputError message={errors.customer_id} />
                </div>
                <div className="min-w-0 space-y-1.5">
                    <Label>
                        Loan product <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={productId}
                        onChange={onProductChange}
                        options={[
                            { value: '', label: 'Select product' },
                            ...products.map((product) => ({
                                value: String(product.id),
                                label: `${product.code} - ${product.name}`,
                            })),
                        ]}
                    />
                    <InputError message={errors.financial_product_id} />
                </div>
                <div className="min-w-0 space-y-1.5 sm:col-span-2">
                    <Label>Credit-life insurance (optional)</Label>
                    <Select
                        value={protectionProductId}
                        onChange={onProtectionProductChange}
                        options={[
                            { value: '', label: 'No insurance selected' },
                            ...protectionProducts.map((product) => ({
                                value: String(product.id),
                                label: `${product.code} - ${product.name} (${product.monthly_rate_percent}% monthly)`,
                            })),
                        ]}
                    />
                    <p className="text-xs text-muted-foreground">
                        Pays the outstanding loan principal after an approved
                        death claim. Monthly premiums use the principal
                        remaining after each scheduled repayment.
                    </p>
                    <InputError message={errors.loan_protection_product_id} />
                </div>
                <div className="min-w-0 space-y-1.5">
                    <Label>
                        Requested amount (৳){' '}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        value={amount}
                        onChange={(e) => onAmountChange(e.target.value)}
                        placeholder="0.00"
                        className="h-10 tabular-nums"
                    />
                    <InputError message={errors.requested_amount} />
                </div>
                <div className="min-w-0 space-y-1.5">
                    <Label>
                        Term (months){' '}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        type="number"
                        min="1"
                        step="1"
                        value={term}
                        onChange={(e) => onTermChange(e.target.value)}
                        placeholder="12"
                        className="h-10 tabular-nums"
                    />
                    <InputError message={errors.requested_term_months} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                    <Label>Purpose of loan</Label>
                    <Input
                        value={purpose}
                        onChange={(e) => onPurposeChange(e.target.value)}
                        placeholder="Briefly describe how the loan will be used"
                        className="h-10"
                    />
                    <InputError message={errors.purpose} />
                </div>
            </div>
        </section>
    );
}
