import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const appSwal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        popup: 'rounded-2xl p-6 !bg-popover !text-popover-foreground shadow-lg !border !border-secondary/30',
        title: 'text-lg font-semibold',
        confirmButton:
            'bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90',
        cancelButton:
            'bg-secondary text-secondary-foreground px-4 py-2 rounded-lg ml-2',
    },
});
