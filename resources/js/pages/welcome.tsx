import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLogo from '../components/app-logo';
import CustomAuthLayout from '../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../types';

export default function HomePage() {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'User Home', href: '#' }];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="User Home" />

            <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 px-4"
            >
                {/* Hero Card */}
                <div className="w-full max-w-5xl">
                    <div className="flex items-center justify-center">
                        <div className="">
                            <AppLogo />
                        </div>
                    </div>
                </div>

                {/* Footer Hint */}
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-semibold">
                        <span className="text-primary">
                            {import.meta.env.VITE_APP_NAME_FIRST}
                        </span>
                        <span className="text-foreground/90">
                            {import.meta.env.VITE_APP_NAME_SECOND}
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground/80">
                        {import.meta.env.VITE_APP_LONG_TAG}
                    </p>
                    <div className="text-center text-sm text-muted-foreground/80">
                        {`© ${new Date().getFullYear()} Denton Studio. ${import.meta.env.VITE_APP_COPYRIGHT}`}
                    </div>
                    <div className="mt-3 inline-block rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {import.meta.env.VITE_APP_VERSION}
                    </div>
                </div>
            </motion.div>
        </CustomAuthLayout>
    );
}
