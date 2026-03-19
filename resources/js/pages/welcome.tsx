import { Head } from '@inertiajs/react';

import CustomAuthLayout from '../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../types';

export default function HomePage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: '/dashboard' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />

            <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-10 px-4">
                {/* Hero Card */}
                <div className="relative w-full max-w-5xl bg-background">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="relative h-32 w-32 rounded-full border bg-background object-contain p-4 md:h-48 md:w-48"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Hint */}
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-semibold">
                        <span className="text-muted-foreground">
                            Welcome to
                        </span>
                        <span className="text-accent"> Union </span>
                        Banking
                    </h1>
                    <p className="text-muted-foreground/80 text-sm">
                        Core banking & credit solution for co-operative credit
                        unions.
                    </p>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
