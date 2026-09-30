import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

import AppLogo from '../components/app-logo';
import CustomAuthLayout from '../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../types';

interface User {
    name?: string;
    email?: string;
}

interface Quote {
    message?: string;
}

interface PageProps {
    auth: {
        user: User;
    };
    quote: Quote;
}

export default function HomePage({ quote }: { quote: Quote }) {
    const { auth } = usePage<PageProps>().props;

    const user = auth?.user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Home',
            href: '#',
        },
    ];

    const firstName = user?.name?.split(' ')[0] ?? 'User';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />

            <div className="relative min-h-[calc(100vh-150px)] overflow-hidden">
                {/* Decorative background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:py-10"
                >
                    {/* Main Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl"
                    >
                        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

                        <div className="relative flex flex-col items-center px-6 py-10 text-center md:px-10 md:py-14">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    delay: 0.35,
                                    duration: 0.5,
                                }}
                                className="mb-6"
                            >
                                <AppLogo />
                            </motion.div>

                            {/* Application Name */}
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                <span className="text-primary">
                                    {import.meta.env.VITE_APP_NAME_FIRST}
                                </span>{' '}
                                <span className="text-foreground/90">
                                    {import.meta.env.VITE_APP_NAME_SECOND}
                                </span>
                            </h2>

                            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                                {import.meta.env.VITE_APP_LONG_TAG}
                            </p>

                            {/* Quote */}
                            {quote?.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.5,
                                        duration: 0.5,
                                    }}
                                    className="mt-8 w-full max-w-3xl"
                                >
                                    <div className="relative rounded-2xl border bg-muted/40 px-6 py-6 sm:px-10">
                                        <Sparkles className="absolute top-4 left-4 h-4 w-4 text-primary/60" />

                                        <blockquote className="px-4 text-base leading-7 font-medium text-foreground/80 sm:text-lg sm:leading-8">
                                            “{quote.message}”
                                        </blockquote>

                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <div className="h-px w-8 bg-border" />
                                            <Heart className="h-3.5 w-3.5 text-primary/60" />
                                            <div className="h-px w-8 bg-border" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Footer / Application Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex flex-col items-center gap-2 pb-4 text-center"
                    >
                        <p className="text-xs text-muted-foreground">
                            {`© ${new Date().getFullYear()} Denton Studio. ${
                                import.meta.env.VITE_APP_COPYRIGHT
                            }`}
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                {import.meta.env.VITE_APP_VERSION}
                            </span>

                            <span className="text-xs text-muted-foreground/60">
                                •
                            </span>

                            <span className="text-xs text-muted-foreground">
                                All rights reserved
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </CustomAuthLayout>
    );
}
