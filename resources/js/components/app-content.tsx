import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({
    variant = 'header',
    children,
    ...props
}: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset {...props}>
                <div className="app-page-content">{children}</div>
            </SidebarInset>
        );
    }

    return (
        <main
            {...props}
            className={cn(
                'app-main flex h-full w-full flex-1 flex-col gap-4 rounded-xl bg-background/70 p-4 md:p-6',
                props.className,
            )}
        >
            <div className="app-page-content">{children}</div>
        </main>
    );
}
