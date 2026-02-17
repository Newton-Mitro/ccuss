import { Head } from '@inertiajs/react';

import CustomAuthLayout from '../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../types';

export default function HomePage() {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/home' }];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />

            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4">
                {/* Hero Card */}
                <div className="relative w-full max-w-5xl bg-background">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="relative h-56 w-56 rounded-full border border-border bg-background object-contain p-4 md:h-64 md:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Hint */}
                <p className="mt-6 text-center text-sm text-muted-foreground/50">
                    Designed for finance teams • Built with Laravel, Inertia &
                    React
                </p>
            </div>
        </CustomAuthLayout>
    );
}
