import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface FinancialAccountActivationProps {
    accountId: number;
    status: string;
}

export default function FinancialAccountActivation({
    accountId,
    status,
}: FinancialAccountActivationProps) {
    const { auth } = usePage<{
        auth: { user: { permissions?: Array<{ slug: string }> } };
    }>().props;
    const [processing, setProcessing] = useState(false);
    const canActivate = (auth.user.permissions ?? []).some(
        (permission) => permission.slug === 'financial.accounts.update',
    );

    if (status !== 'PENDING' || !canActivate) return null;

    return (
        <Button
            type="button"
            disabled={processing}
            onClick={() => {
                setProcessing(true);
                router.post(
                    route('financial-accounts.activate', accountId),
                    {},
                    {
                        preserveScroll: true,
                        onFinish: () => setProcessing(false),
                    },
                );
            }}
        >
            {processing ? 'Activating...' : 'Activate account'}
        </Button>
    );
}
