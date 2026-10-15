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
                    className="min-w-0 rounded-md border bg-card p-4"
                >
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate text-xs font-medium">
                            {label}
                        </span>
                    </div>
                    <div className="mt-3 truncate text-xl font-semibold tabular-nums">
                        {value}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
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
                    className="group flex min-w-0 items-center justify-between gap-3 rounded-md border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        {Icon && (
                            <Icon className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span className="truncate">{linkLabel}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
            ))}
        </nav>
    );
}
