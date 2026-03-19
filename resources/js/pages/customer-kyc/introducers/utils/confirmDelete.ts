// utils/confirmDelete.ts
import Swal from 'sweetalert2';

export const confirmDelete = () => {
    const isDark = document.documentElement.classList.contains('dark');

    return Swal.fire({
        title: 'Are you sure?',
        text: 'This address will be permanently deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        confirmButtonColor: isDark ? '#ef4444' : '#d33',
        cancelButtonColor: isDark ? '#3b82f6' : '#3085d6',
        background: isDark ? '#1f2937' : '#fff',
        color: isDark ? '#f9fafb' : '#111827',
    });
};
