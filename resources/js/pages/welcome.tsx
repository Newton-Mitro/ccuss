import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import CustomAuthLayout from '../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../types';

export default function HomePage({
    appNameFirst,
    appNameSecond,
    appVersion,
    appLongTag,
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: '/dashboard' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />

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
                            <img
                                src={import.meta.env.VITE_LOGO_PATH}
                                alt="Logo"
                                className="w-28 bg-background object-contain p-4 md:w-48"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Hint */}
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-semibold">
                        <span className="text-primary"> {appNameFirst} </span>
                        <span className="text-foreground/90">
                            {appNameSecond}
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground/80">
                        {appLongTag}
                    </p>
                    <div className="text-center text-sm text-muted-foreground/80">
                        {`© ${new Date().getFullYear()} Denton Studio. সর্বস্বত্ব সংরক্ষিত। লিখিত অনুমতি ছাড়া এই উপাদান সম্পূর্ণ বা আংশিকভাবে ব্যবহার বা কপি করা আইনত নিষিদ্ধ।`}
                    </div>
                    <div className="mt-3 inline-block rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {appVersion}
                    </div>
                </div>
            </motion.div>
        </CustomAuthLayout>
    );
}
