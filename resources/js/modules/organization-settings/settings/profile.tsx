import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import DeleteUser from '@/modules/organization-settings/components/delete-user';
import SettingsPageHeader from '@/modules/organization-settings/components/settings-page-header';
import { edit } from '@/routes/profile';
import { Mail, UserRound } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 text-foreground">
                <SettingsPageHeader
                    title="Profile & personal details"
                    description="Keep your name and email address up to date so your account information stays accurate."
                    icon={UserRound}
                />

                <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border/70 bg-muted/15 px-5 py-4 sm:px-6">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UserRound className="size-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold">
                                Profile information
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Update the personal details associated with your
                                account.
                            </p>
                        </div>
                    </div>
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-5 p-5 sm:p-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid content-start gap-2">
                                        <Label
                                            htmlFor="name"
                                            className="flex items-center gap-2"
                                        >
                                            <UserRound className="size-3.5 text-muted-foreground" />
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            className="h-10 w-full"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="text-xs"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid content-start gap-2">
                                        <Label
                                            htmlFor="email"
                                            className="flex items-center gap-2"
                                        >
                                            <Mail className="size-3.5 text-muted-foreground" />
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="h-10 w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="text-xs"
                                            message={errors.email}
                                        />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                            Changes saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <DeleteUser />
            </div>
        </CustomAuthLayout>
    );
}
