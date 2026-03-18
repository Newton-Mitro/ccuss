import { useEffect, useState } from 'react';

export function useThemeColors() {
    const [colors, setColors] = useState(() => ({
        primary: '',
        background: '',
        foreground: '',
        border: '',
        accent: '',
        ring: '',
    }));

    useEffect(() => {
        // Schedule DOM read + state update after paint to avoid sync warning
        const updateColors = () => {
            const root = getComputedStyle(document.documentElement);
            setColors({
                primary: root.getPropertyValue('--color-primary').trim(),
                background: root.getPropertyValue('--color-background').trim(),
                foreground: root.getPropertyValue('--color-foreground').trim(),
                border: root.getPropertyValue('--color-border').trim(),
                accent: root.getPropertyValue('--color-accent').trim(),
                ring: root.getPropertyValue('--color-ring').trim(),
            });
        };

        // Use requestAnimationFrame to defer the state update safely
        const frameId = requestAnimationFrame(updateColors);

        // Clean up when unmounting
        return () => cancelAnimationFrame(frameId);
    }, []);

    return colors;
}
