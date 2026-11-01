import type { LucideIcon } from 'lucide-react';

export default function SettingsPageHeader({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
}) {
    return (
        <section
            aria-labelledby="settings-page-title"
            className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.12] via-card to-card px-5 py-5 shadow-sm sm:px-7 sm:py-6"
        >
            <div className="pointer-events-none absolute -top-16 right-4 -z-10 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="flex items-center gap-4">
                <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-background/75 text-primary shadow-sm sm:flex">
                    <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                        Account settings
                    </p>
                    <h1
                        id="settings-page-title"
                        className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl"
                    >
                        {title}
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
                        {description}
                    </p>
                </div>
            </div>
        </section>
    );
}
