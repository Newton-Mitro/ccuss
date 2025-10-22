import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono">
            <Head title="Forgot password" />

            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg md:p-10">
                {/* Logo + Intro */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <AppLogoIcon className="mb-3 h-20 w-20 fill-current text-primary" />
                    <div className="text-sm font-medium text-primary">
                        Forgot your{' '}
                        <span className="text-foreground">password?</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Enter your email to receive a reset link
                    </div>
                </div>

                {/* Status message */}
                {status && (
                    <div className="mb-4 rounded border border-border bg-muted p-2 text-center text-xs font-medium text-green-600">
                        {status}
                    </div>
                )}

                {/* Form */}
                <Form {...email.form()} className="space-y-4">
                    {({ processing, errors }) => (
                        <>
                            {/* Email Field */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs text-muted-foreground"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoFocus
                                    required
                                    autoComplete="off"
                                    placeholder="you@example.com"
                                />
                                <InputError
                                    message={errors.email}
                                    className="text-xs"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && <Spinner />}
                                Email password reset link
                            </Button>

                            {/* Back to login */}
                            <div className="pt-3 text-center text-xs text-muted-foreground">
                                Or, return to{' '}
                                <TextLink
                                    href={login()}
                                    className="text-primary hover:underline"
                                >
                                    Log in
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
