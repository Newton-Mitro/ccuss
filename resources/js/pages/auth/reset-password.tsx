import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono">
            <Head title="Reset password" />

            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg md:p-10">
                {/* Logo + Intro */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <AppLogoIcon className="mb-3 h-20 w-20 fill-current text-primary" />
                    <div className="text-sm font-medium text-primary">
                        Reset your{' '}
                        <span className="text-foreground">password</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Please enter your new password below
                    </div>
                </div>

                {/* Form */}
                <Form
                    {...update.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs text-muted-foreground"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    readOnly
                                    className="cursor-not-allowed bg-muted"
                                />
                                <InputError
                                    message={errors.email}
                                    className="text-xs"
                                />
                            </div>

                            {/* New Password */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password"
                                    className="text-xs text-muted-foreground"
                                >
                                    New password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoFocus
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                                <InputError
                                    message={errors.password}
                                    className="text-xs"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs text-muted-foreground"
                                >
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="text-xs"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Reset password
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
