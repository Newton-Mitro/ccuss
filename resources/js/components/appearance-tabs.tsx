import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { mode, color, updateMode, updateColor } = useAppearance();

    const modeTabs = [
        {
            value: 'light',
            icon: Sun,
            label: 'Light',
            description: 'Bright and crisp',
            preview: 'bg-white',
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Dark',
            description: 'Easy on the eyes',
            preview: 'bg-slate-900',
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'System',
            description: 'Match your device',
            preview: 'bg-gradient-to-r from-white to-slate-900',
        },
    ] as const;

    const colorTabs = [
        {
            value: 'default',
            label: 'Default',
            description: 'Balanced neutral',
            bg: 'bg-neutral-500',
            soft: 'bg-neutral-200',
        },
        {
            value: 'blue',
            label: 'Blue',
            description: 'Calm and focused',
            bg: 'bg-blue-500',
            soft: 'bg-blue-100',
        },
        {
            value: 'green',
            label: 'Green',
            description: 'Fresh and grounded',
            bg: 'bg-green-500',
            soft: 'bg-green-100',
        },
        {
            value: 'brown',
            label: 'Brown',
            description: 'Warm and classic',
            bg: 'bg-amber-600',
            soft: 'bg-amber-100',
        },
        {
            value: 'violet',
            label: 'Violet',
            description: 'Bright and creative',
            bg: 'bg-violet-500',
            soft: 'bg-violet-100',
        },
    ] as const;

    return (
        <div className={cn('space-y-7', className)} {...props}>
            <section
                aria-labelledby="appearance-mode-heading"
                className="space-y-3"
            >
                <div>
                    <h3
                        id="appearance-mode-heading"
                        className="text-sm font-semibold"
                    >
                        Interface mode
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Choose how the workspace looks across this browser.
                    </p>
                </div>
                <div
                    role="group"
                    aria-label="Interface mode"
                    className="grid gap-2 sm:grid-cols-3"
                >
                    {modeTabs.map(
                        ({
                            value,
                            icon: Icon,
                            label,
                            description,
                            preview,
                        }) => {
                            const selected = mode === value;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => updateMode(value)}
                                    className={cn(
                                        'group relative flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                                        selected
                                            ? 'border-primary/50 bg-primary/[0.045] ring-2 ring-primary/15'
                                            : 'border-border/70 bg-background hover:border-primary/30',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/70 shadow-inner',
                                            preview,
                                            value === 'dark'
                                                ? 'text-white'
                                                : value === 'system'
                                                  ? 'text-primary'
                                                  : 'text-amber-500',
                                        )}
                                    >
                                        <Icon className="size-5 drop-shadow-sm" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold">
                                            {label}
                                        </span>
                                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                            {description}
                                        </span>
                                    </span>
                                    {selected && (
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="size-3" />
                                        </span>
                                    )}
                                </button>
                            );
                        },
                    )}
                </div>
            </section>

            <section
                aria-labelledby="appearance-color-heading"
                className="space-y-3 border-t border-border/70 pt-6"
            >
                <div>
                    <h3
                        id="appearance-color-heading"
                        className="text-sm font-semibold"
                    >
                        Accent color
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Pick a color for highlights, buttons, and active
                        controls.
                    </p>
                </div>
                <div
                    role="group"
                    aria-label="Accent color"
                    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
                >
                    {colorTabs.map(
                        ({ value, label, description, bg, soft }) => {
                            const selected = color === value;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => updateColor(value)}
                                    className={cn(
                                        'group flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none lg:flex-col lg:items-start',
                                        selected
                                            ? 'border-primary/50 bg-primary/[0.045] ring-2 ring-primary/15'
                                            : 'border-border/70 bg-background hover:border-primary/30',
                                    )}
                                >
                                    <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background">
                                        <span
                                            className={cn(
                                                'absolute inset-1 rounded-full',
                                                soft,
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'relative size-5 rounded-full shadow-sm ring-2 ring-background',
                                                bg,
                                            )}
                                        />
                                    </span>
                                    <span className="min-w-0 flex-1 lg:w-full">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold">
                                                {label}
                                            </span>
                                            {selected && (
                                                <Check className="size-3.5 shrink-0 text-primary" />
                                            )}
                                        </span>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                            {description}
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-2 block h-1 w-full rounded-full opacity-90',
                                                bg,
                                            )}
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>
                            );
                        },
                    )}
                </div>
            </section>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'size-2 rounded-full',
                            mode === 'system' ? 'bg-primary' : 'bg-emerald-500',
                        )}
                    />
                    <p className="text-xs font-semibold">
                        {mode === 'system'
                            ? 'Following your device'
                            : `${mode === 'light' ? 'Light' : 'Dark'} mode selected`}
                    </p>
                </div>
                <p className="mt-1 pl-4 text-[11px] leading-5 text-muted-foreground">
                    {mode === 'system'
                        ? 'The interface will automatically match your device’s light or dark setting.'
                        : `Your ${mode} preference is saved automatically and applies across the workspace.`}
                </p>
            </div>
        </div>
    );
}
