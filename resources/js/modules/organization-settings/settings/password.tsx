import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import SettingsPageHeader from '@/modules/organization-settings/components/settings-page-header';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { edit } from '@/routes/user-password';
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 text-foreground">
                <SettingsPageHeader
                    title="Password & sign-in"
                    description="Refresh your password regularly and use a strong, unique combination to protect your account."
                    icon={KeyRound}
                />

                <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border/70 bg-muted/15 px-5 py-4 sm:px-6">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LockKeyhole className="size-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold">
                                Update password
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Enter your current password, then choose a new
                                one.
                            </p>
                        </div>
                    </div>
                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-5 p-5 sm:p-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid content-start gap-2">
                                        <Label
                                            htmlFor="current_password"
                                            className="flex items-center gap-2"
                                        >
                                            <ShieldCheck className="size-3.5 text-muted-foreground" />
                                            Current password
                                        </Label>
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type="password"
                                            className="h-10 w-full"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                        />

                                        <InputError
                                            className="text-xs"
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="grid content-start gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="flex items-center gap-2"
                                        >
                                            <KeyRound className="size-3.5 text-muted-foreground" />
                                            New password
                                        </Label>
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type="password"
                                            className="h-10 w-full"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                        />

                                        <InputError
                                            className="text-xs"
                                            message={errors.password}
                                        />
                                    </div>

                                    <div className="grid content-start gap-2 md:col-span-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="flex items-center gap-2"
                                        >
                                            <KeyRound className="size-3.5 text-muted-foreground" />
                                            Confirm new password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            className="h-10 w-full md:max-w-[calc(50%-0.625rem)]"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                        />

                                        <InputError
                                            className="text-xs"
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        Save password
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                            Password updated
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </section>
                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-xs leading-5 text-muted-foreground">
                        Use a unique password that you do not reuse on other
                        sites. Two-factor authentication adds another layer of
                        protection to your sign-in.
                    </p>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
