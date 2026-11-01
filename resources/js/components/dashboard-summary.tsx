import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardMetric {
    label: string;
    value: ReactNode;
    detail: string;
    icon: LucideIcon;
}

export function DashboardMetricGrid({
    metrics,
    className,
}: {
    metrics: DashboardMetric[];
    className?: string;
}) {
    return (
        <section
            aria-label="Dashboard metrics"
            className={cn(
                'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4',
                className,
            )}
        >
            {metrics.map(({ label, value, detail, icon: Icon }) => (
                <div
                    key={label}
                    className="group relative min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                >
                    <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-primary/[0.035] blur-2xl transition-colors group-hover:bg-primary/[0.08]" />
                    <div className="relative flex items-center gap-2.5 text-muted-foreground">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate text-xs font-semibold">
                            {label}
                        </span>
                    </div>
                    <div className="relative mt-4 truncate text-2xl font-semibold tracking-tight tabular-nums">
                        {value}
                    </div>
                    <div className="relative mt-1 truncate text-[11px] text-muted-foreground">
                        {detail}
                    </div>
                </div>
            ))}
        </section>
    );
}

interface DashboardQuickLink {
    label: string;
    href: string;
    icon?: LucideIcon;
}

export function DashboardQuickLinks({
    links,
    label = 'Dashboard shortcuts',
}: {
    links: DashboardQuickLink[];
    label?: string;
}) {
    if (!links.length) {
        return null;
    }

    return (
        <nav
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
            aria-label={label}
        >
            {links.map(({ label: linkLabel, href, icon: Icon }) => (
                <Link
                    key={`${linkLabel}-${href}`}
                    href={href}
                    className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.025] hover:shadow-md"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        {Icon && (
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="size-4" />
                            </span>
                        )}
                        <span className="truncate">{linkLabel}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
            ))}
        </nav>
    );
}
