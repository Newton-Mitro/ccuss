import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function useFlashToastHandler() {
    const { flash } = usePage().props as any;
    const shownRef = useRef<string | null>(null);

    useEffect(() => {
        if (!flash) return;

        const key = JSON.stringify(flash);

        // Prevent duplicate execution
        if (shownRef.current === key) return;

        if (flash.success) {
            toast.success(flash.success);
        }

        if (flash.error) {
            toast.error(flash.error);
        }

        shownRef.current = key;
    }, [flash]);

    return null;
}
