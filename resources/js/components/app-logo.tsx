import { useAppearance } from '@/hooks/use-appearance';

export default function AppLogo({
    className = 'w-28 object-contain p-4 md:w-48',
    ...props
}) {
    const { mode } = useAppearance();

    const isDark =
        mode === 'dark' ||
        (mode === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <img
            src={isDark ? '/logo.png' : '/logo_3.png'}
            alt="Logo"
            className={className}
            {...props}
        />
    );
}
