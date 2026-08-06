import { Head } from '@inertiajs/react';

export default function Forbidden() {
    const handleBack = () => window.history.back();

    return (
        <>
            <Head title="Permission Denied" />

            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-destructive">403</h1>

                    <h2 className="mt-4 text-2xl font-semibold">
                        Permission Denied
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        You do not have the required permission to access this
                        page.
                    </p>

                    <button
                        onClick={handleBack}
                        className="mt-6 inline-block rounded bg-primary px-5 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </>
    );
}
