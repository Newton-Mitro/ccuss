// utils/confirmDelete.ts

import { appSwal } from '../../../../lib/appSwal';

export const confirmDelete = () => {
    return appSwal.fire({
        title: 'Are you sure?',
        text: 'This address will be permanently deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
    });
};
