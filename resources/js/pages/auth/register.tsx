import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

export default function Register() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono">
            <Head title="Register" />

            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg md:p-10">
                {/* Logo + Intro */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <AppLogoIcon className="mb-3 h-20 w-20 fill-current text-primary" />
                    <div className="text-sm font-medium text-primary">
                        Join <span className="text-foreground">DCCCEC</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Create an account to get started
                    </div>
                </div>

                {/* Form */}
                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Name */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="name"
                                    className="text-xs text-muted-foreground"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="text-xs"
                                />
                            </div>

                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs text-muted-foreground"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
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
                                <Label
                                    htmlFor="password"
                                    className="text-xs text-muted-foreground"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
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
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="text-xs"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>

                            {/* Login link */}
                            <div className="pt-3 text-center text-xs text-muted-foreground">
                                Already have an account?{' '}
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
