import { Head } from '@inertiajs/react';

export default function ServerError() {
    return (
        <>
            <Head title="Internal Server Error" />

            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-destructive">500</h1>

                    <h2 className="mt-4 text-2xl font-semibold">
                        Internal Server Error
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        Something went wrong on our server. Please try again
                        later.
                    </p>
                </div>
            </div>
        </>
    );
}
