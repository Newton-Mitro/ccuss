import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const appSwal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        popup: 'rounded-2xl p-6 !bg-card !text-popover-foreground shadow-lg !border !border-warning/30',
        title: 'text-lg font-semibold',
        confirmButton:
            'bg-primary border border-warning/30 text-primary-foreground px-4 min-w-[80px] py-1 rounded-lg hover:opacity-80',
        cancelButton:
            'bg-secondary border border-warning/30 text-secondary-foreground px-4 py-1 rounded-lg ml-2',
    },
});
