import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { mode, color, updateMode, updateColor } = useAppearance();

    const modeTabs = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ] as const;

    const colorTabs = [
        { value: 'default', label: 'Default', bg: 'bg-neutral-400' },
        { value: 'blue', label: 'Blue', bg: 'bg-blue-500' },
        { value: 'green', label: 'Green', bg: 'bg-green-500' },
        { value: 'brown', label: 'Brown', bg: 'bg-amber-600' },
        { value: 'violet', label: 'Violet', bg: 'bg-violet-500' },
    ] as const;

    return (
        <div className={cn('space-y-4', className)} {...props}>
            {/* Mode Selector */}
            <div className="inline-flex rounded-full bg-neutral-200 p-1 shadow-inner dark:bg-neutral-700">
                {modeTabs.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        onClick={() => updateMode(value)}
                        className={cn(
                            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                            mode === value
                                ? 'bg-white text-black shadow dark:bg-neutral-600 dark:text-white'
                                : 'text-neutral-600 hover:bg-white/30 dark:text-neutral-300 dark:hover:bg-neutral-600/50',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Color Selector */}
            <div className="flex gap-2">
                {colorTabs.map(({ value, label, bg }) => (
                    <button
                        key={value}
                        onClick={() => updateColor(value)}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
                            color === value
                                ? 'bg-white text-black shadow dark:bg-neutral-600 dark:text-white'
                                : 'text-neutral-600 hover:bg-white/30 dark:text-neutral-300 dark:hover:bg-neutral-600/50',
                        )}
                    >
                        <span className={`h-4 w-4 rounded-full border ${bg}`} />
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
