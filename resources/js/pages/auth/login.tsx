import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Login({ status, canResetPassword, canRegister }) {
    useEffect(() => {
        localStorage.clear();
    }, []);

    return (
        <div className="flex min-h-screen bg-card/50">
            <Head title="Log in" />

            {/* Left Branding Section */}
            <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="hidden w-7/12 flex-col items-center justify-center lg:flex"
            >
                <img src="/logo.png" alt="Logo" className="h-60 w-60" />

                <div className="mt-3 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        <span className="text-primary">Union</span> Banking
                    </h1>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Smart core banking & credit solution designed for modern
                        cooperative institutions.
                    </p>
                    <div className="mt-3 inline-block rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Version 1.0
                    </div>
                </div>
            </motion.div>

            {/* Right Form Section */}
            <div className="mx-4 flex w-full flex-col items-center justify-center lg:w-4/12">
                <div className="flex h-[calc(90vh)] w-full flex-col items-center justify-center rounded border bg-card p-6 shadow">
                    <div className="w-full lg:px-20">
                        {/* Header */}
                        <div className="mb-6 text-center">
                            <AppLogoIcon className="mx-auto h-28 w-28 text-accent" />
                            <h2 className="mt-3 text-sm text-muted-foreground">
                                Welcome back to
                            </h2>
                            <h1 className="text-xl font-bold tracking-tight">
                                <span className="text-primary">Union</span>{' '}
                                Banking
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Login to your account to continue
                            </p>
                        </div>

                        {/* Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email */}
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="email"
                                            className="text-xs"
                                        >
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            placeholder="you@example.com"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="text-xs"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="text-xs"
                                            >
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs text-accent hover:underline"
                                                >
                                                    Forgot?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            placeholder="••••••••"
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="text-xs"
                                        />
                                    </div>

                                    {/* Remember */}
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-xs"
                                        >
                                            Remember me
                                        </Label>
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex w-full items-center justify-center gap-2"
                                    >
                                        {processing && <Spinner />}
                                        Sign In
                                    </Button>

                                    {/* Register */}
                                    {canRegister && (
                                        <p className="text-center text-xs text-muted-foreground">
                                            No account?{' '}
                                            <TextLink className="text-accent hover:underline">
                                                Create one
                                            </TextLink>
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>

                        {/* Status */}
                        {status && (
                            <div className="mt-4 rounded-lg bg-muted p-2 text-center text-sm text-accent">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
