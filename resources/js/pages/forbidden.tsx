import { Head } from '@inertiajs/react';

export default function Forbidden() {
    return (
        <>
            <Head title="Permission Denied" />

            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-red-600">403</h1>

                    <h2 className="mt-4 text-2xl font-semibold">
                        Permission Denied
                    </h2>

                    <p className="mt-2 text-gray-600">
                        You do not have the required permission to access this
                        page.
                    </p>

                    <a
                        href="/dashboard"
                        className="mt-6 inline-block rounded bg-blue-600 px-5 py-2 text-white"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </>
    );
}
