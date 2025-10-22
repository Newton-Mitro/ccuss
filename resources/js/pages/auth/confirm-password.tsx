import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono">
            <Head title="Confirm password" />

            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg md:p-10">
                {/* Logo + Intro */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <AppLogoIcon className="mb-3 h-20 w-20 fill-current text-primary" />
                    <div className="text-sm font-medium text-primary">
                        Confirm your{' '}
                        <span className="text-foreground">password</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        This is a secure area of the app. Please verify your
                        credentials before continuing.
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
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                    autoComplete="current-password"
                                />
                                <InputError
                                    message={errors.password}
                                    className="text-xs"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                Confirm password
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
