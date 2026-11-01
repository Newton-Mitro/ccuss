import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { type BreadcrumbItem } from '@/types';

import CustomAuthLayout from '@/layouts/custom-auth-layout';
import SettingsPageHeader from '@/modules/organization-settings/components/settings-page-header';
import { edit as editAppearance } from '@/routes/appearance';
import { MonitorCog, Palette } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 text-foreground">
                <SettingsPageHeader
                    title="Appearance"
                    description="Personalize the look and feel of your workspace. Changes apply immediately and are saved automatically."
                    icon={Palette}
                />

                <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border/70 bg-muted/15 px-5 py-4 sm:px-6">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <MonitorCog className="size-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold">
                                Personalize your workspace
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Select an interface mode and accent color.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-5 p-5 sm:p-6">
                        <AppearanceTabs />
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
