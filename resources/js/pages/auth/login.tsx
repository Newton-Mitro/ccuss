import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono">
            <Head title="Log in" />

            <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg md:p-10">
                {/* Logo + Intro */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <AppLogoIcon className="mb-3 h-20 w-20 fill-current text-primary" />
                    <div className="text-sm font-medium text-primary">
                        Welcome back to{' '}
                        <span className="text-foreground">DCCCEC</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Authenticate to continue
                    </div>
                </div>

                {/* Form */}
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
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
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                />
                                <InputError
                                    message={errors.email}
                                    className="text-xs"
                                />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                />
                                <InputError
                                    message={errors.password}
                                    className="text-xs"
                                />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" name="remember" />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs text-muted-foreground"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>

                            {/* Register */}
                            {canRegister && (
                                <div className="pt-3 text-center text-xs text-muted-foreground">
                                    Don’t have an account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="text-primary hover:underline"
                                    >
                                        Register
                                    </TextLink>
                                </div>
                            )}
                        </>
                    )}
                </Form>

                {/* Status Message */}
                {status && (
                    <div className="mt-4 rounded border border-border bg-muted p-2 text-center text-sm font-medium text-primary">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
