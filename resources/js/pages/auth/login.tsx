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
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono transition-colors duration-300">
            <Head title="Log in" />

            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg transition-colors duration-300 md:p-10 dark:shadow-xl dark:shadow-black/30">
                {/* Logo + Intro */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <AppLogoIcon className="mb-3 h-20 w-20 fill-current text-primary transition-colors duration-300" />
                    <div className="text-sm font-medium text-primary transition-colors duration-300">
                        Welcome back to{' '}
                        <span className="text-foreground">DCCCEC</span>
                    </div>
                    <div className="text-xs text-muted-foreground transition-colors duration-300">
                        Authenticate to continue
                    </div>
                </div>

                {/* Form */}
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="space-y-4 transition-colors duration-300"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs text-muted-foreground transition-colors duration-300"
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
                                    className="transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-primary"
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
                                        className="text-xs text-muted-foreground transition-colors duration-300"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-primary transition-colors duration-300 hover:underline"
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
                                    className="transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-primary"
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
                                    className="text-xs text-muted-foreground transition-colors duration-300"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>

                            {/* Register */}
                            {canRegister && (
                                <div className="pt-3 text-center text-xs text-muted-foreground transition-colors duration-300">
                                    Don’t have an account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="text-primary transition-colors duration-300 hover:underline"
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
                    <div className="mt-4 rounded border border-border bg-muted p-2 text-center text-sm font-medium text-primary transition-colors duration-300">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
