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

            <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 px-4">
                {/* Hero Card */}
                <div className="w-full max-w-5xl bg-background">
                    <div className="flex items-center justify-center">
                        <div className="">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="h-28 w-28 rounded-full border bg-background object-contain p-2 md:h-56 md:w-56"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Hint */}
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-semibold">
                        <span className="text-accent"> Union </span>
                        Banking
                    </h1>
                    <p className="text-sm text-muted-foreground/80">
                        Core banking & credit solution for co-operative credit
                        unions.
                    </p>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
