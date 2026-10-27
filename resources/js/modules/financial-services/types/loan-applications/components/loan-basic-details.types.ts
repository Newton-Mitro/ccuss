import { FormErrors } from '@/modules/financial-services/loan-applications/types';
import type { LoanApplicationFormPageProps } from '@/modules/financial-services/types/financial-services';

export type Props = {
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
