import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import SettingsPageHeader from '@/modules/organization-settings/components/settings-page-header';
import TwoFactorRecoveryCodes from '@/modules/organization-settings/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/modules/organization-settings/components/two-factor-setup-modal';
import type { TwoFactorProps } from '@/modules/organization-settings/types/settings/two-factor.interfaces';
import { disable, enable, show } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { Fingerprint, ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 text-foreground">
                <SettingsPageHeader
                    title="Two-factor authentication"
                    description="Add a second layer of security by requiring a verification code when you sign in."
                    icon={ShieldCheck}
                />

                <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/15 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <span
                                className={`flex size-10 items-center justify-center rounded-xl ${
                                    twoFactorEnabled
                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                }`}
                            >
                                <Fingerprint className="size-5" />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Sign-in verification
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Secure your account with an authenticator
                                    app.
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={twoFactorEnabled ? 'default' : 'secondary'}
                            className={
                                twoFactorEnabled
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : ''
                            }
                        >
                            {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                        </Badge>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                        <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                            <p className="text-sm leading-6 text-muted-foreground">
                                {twoFactorEnabled
                                    ? 'Two-factor authentication is protecting your account. You will need a time-based verification code from your authenticator app when signing in.'
                                    : 'When enabled, you will need a time-based verification code from an authenticator app in addition to your password when signing in.'}
                            </p>
                        </div>

                        {twoFactorEnabled ? (
                            <div className="space-y-5">
                                <TwoFactorRecoveryCodes
                                    recoveryCodesList={recoveryCodesList}
                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                    errors={errors}
                                />

                                <div className="border-t pt-4">
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldBan />
                                                Disable two-factor
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Protect your next sign-in
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Set up an authenticator app and keep
                                        recovery codes somewhere safe.
                                    </p>
                                </div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        className="shrink-0"
                                    >
                                        <ShieldCheck />
                                        Continue setup
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="shrink-0"
                                            >
                                                <ShieldCheck />
                                                Enable two-factor
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </div>
        </CustomAuthLayout>
    );
}
