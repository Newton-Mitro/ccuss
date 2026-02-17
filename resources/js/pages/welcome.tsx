import { Head } from '@inertiajs/react';

import CustomAuthLayout from '../layouts/custom-auth-layout';

export default function HomePage() {
    return (
        <CustomAuthLayout breadcrumbs={[]}>
            <Head title="Home" />

            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4">
                {/* Hero Card */}
                <div className="relative w-full max-w-5xl bg-background">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute -inset-6 rounded-full bg-primary/10 blur-2xl" />
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="relative h-56 w-56 rounded-full border border-border bg-background object-contain p-4 shadow-lg md:h-64 md:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Hint */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Designed for finance teams • Built with Laravel, Inertia &
                    React
                </p>
            </div>
        </CustomAuthLayout>
    );
}

/* ----------------------------- */
/* Feature Component */
/* ----------------------------- */
function Feature({
    icon: Icon,
    title,
    desc,
}: {
    icon: any;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
        </div>
    );
}
