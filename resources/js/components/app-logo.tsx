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

    const logo = import.meta.env.VITE_LOGO_PATH;

    return (
        <img
            src={logo}
            alt={import.meta.env.VITE_APP_NAME}
            className={className + (isDark ? ' invert' : '')}
            {...props}
        />
    );
}
